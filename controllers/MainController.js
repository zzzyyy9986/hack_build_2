"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainController = void 0;
const Topics_1 = require("../Models/Topics");
const Places_1 = require("../Models/Places");
const GigaHelper_1 = require("../helpers/GigaHelper");
const dataWithEmbeddings_1 = require("../db/dataWithEmbeddings");
const MyTestQueue_1 = require("../helpers/MyTestQueue");
class MainController {
    static async getLllResponse(req, res) {
        const { spawnSync } = require("child_process");
        const search = req.body.value ?? "Добрый день! Хочу выбрать телефон";
        const uniqueId = req.body.uniqueId ?? 123123;
        // const chatKey = "1234";
        const pythonProcess = await spawnSync("python3", [
            "./src/python/main.py",
            uniqueId,
            search,
        ]);
        const result = pythonProcess.stdout?.toString()?.trim();
        const error = pythonProcess.stderr?.toString()?.trim();
        console.log(result);
        if (result) {
            res.send({
                data: { result },
            });
        }
        else {
            res.send({
                error,
            });
        }
        // process.stdout.on("data", function (data: any) {
        //   res.send(data.toString());
        // });
    }
    /**
     * Получить список актуальных тем по языку(этнической категории).
     * @param req
     * @param res
     */
    static getListOfTopicsByLanguage(req, res) {
        const languageId = req.body.languageId ?? "ru";
        const listOfTopics = Topics_1.Topics.getListOfTopickByLanguge(languageId);
        res.send({
            data: { listOfTopics },
        });
    }
    /**
     * Получить список мест по тэгам
     * @param req
     * @param res
     */
    static getListOfPlacesByTag(req, res) {
        const topicId = req.body.topicId ?? 7;
        const listOfPlaces = Places_1.Places.getListOfPlacesByTag(topicId);
        res.send({
            data: { listOfPlaces },
        });
    }
    /**
     * Заполнять инфу об embeddings
     * @param req
     * @param res
     */
    static async getGigaEmbedding(req, res) {
        const gigaRes = await GigaHelper_1.GigaHelper.getGigaEmbedings("test");
        console.log(gigaRes);
        const finalRes = [];
        for (let i = 0; i < Places_1.Places.data.length; i++) {
            // if (Places.data[i].id !== dataWithEmbeddings[i]?.id) {
            const giga = await GigaHelper_1.GigaHelper.getGigaEmbedings(Places_1.Places.data[i].description);
            console.log("Добавляю новое!!");
            finalRes.push({
                ...Places_1.Places.data[i],
                embedding: giga["data"][0]["embedding"],
            });
        }
        if (1 > 2) {
            console.log("here!!");
            finalRes.push(dataWithEmbeddings_1.dataWithEmbeddings);
            // }
        }
        res.send({
            data: finalRes,
        });
    }
    /**
     * Поиск по embedding
     * @param req
     * @param res
     */
    static async embeddingSearch(req, res) {
        var distance = require("compute-cosine-distance");
        const search = req.body.value ?? "Винодельня у моря";
        const currentQueue = MyTestQueue_1.MyCurrentQueue.getService();
        const giga = await currentQueue.addAndRun(async () => {
            const giga = await GigaHelper_1.GigaHelper.getGigaEmbedings(search);
            console.log("here");
            console.log(giga);
            let bestMatch = [];
            const bestMatchLenght = 3;
            dataWithEmbeddings_1.dataWithEmbeddings.forEach((el) => {
                if (el.embedding) {
                    let diff = distance(giga["data"][0]["embedding"], el.embedding);
                    if (bestMatch.filter((a) => a.placeId == el.id).length)
                        return false;
                    bestMatch.push({
                        placeId: el.id,
                        diff,
                    });
                }
                else {
                    console.log(el.id);
                }
            });
            bestMatch.sort((a, b) => {
                if (a.diff > b.diff)
                    return 1;
                else
                    return -1;
            });
            console.log("Все совпадения");
            console.log(bestMatch);
            bestMatch = bestMatch.slice(0, bestMatchLenght);
            console.log("лучшие совпадения");
            console.log(bestMatch);
            bestMatch = bestMatch.filter((e) => e.diff < 0.241);
            const finalRes = dataWithEmbeddings_1.dataWithEmbeddings
                .filter((el) => {
                return bestMatch.map((e) => e.placeId).includes(el.id);
            })
                .map((el) => {
                const tempEl = structuredClone(el);
                delete tempEl["embedding"];
                return tempEl;
            });
            res.send({
                data: finalRes,
            });
        });
    }
}
exports.MainController = MainController;
