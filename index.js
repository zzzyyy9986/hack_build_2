"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MainController_1 = require("./controllers/MainController");
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
const pathToFront = __dirname + "/build/";
var cors = require("cors");
let corsOptions = {};
corsOptions = {
    origin: "http://localhost:3000",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};
app.use(express_1.default.static(pathToFront));
app.use(require("express-domain-middleware"));
app.use(express_1.default.json());
app.use(cors(corsOptions));
app.get('/', (req, res) => {
    console.log(pathToFront);
    return res.sendFile(pathToFront + '/index.html');
});
app.get("/getLlmResponse", (req, res) => {
    MainController_1.MainController.getLllResponse(req, res);
});
app.post("/getLlmResponse", (req, res) => {
    MainController_1.MainController.getLllResponse(req, res);
});
app.get("/getListOfTopicsByLanguage", (req, res) => {
    MainController_1.MainController.getListOfTopicsByLanguage(req, res);
});
app.post("/getListOfTopicsByLanguage", (req, res) => {
    MainController_1.MainController.getListOfTopicsByLanguage(req, res);
});
app.get("/getListOfPlacesByTag", (req, res) => {
    MainController_1.MainController.getListOfPlacesByTag(req, res);
});
app.post("/getListOfPlacesByTag", (req, res) => {
    MainController_1.MainController.getListOfPlacesByTag(req, res);
});
app.get("/getGigaEmbedding", (req, res) => {
    MainController_1.MainController.getGigaEmbedding(req, res);
});
app.get("/embeddingSearch", (req, res) => {
    MainController_1.MainController.embeddingSearch(req, res);
});
app.post("/embeddingSearch", (req, res) => {
    MainController_1.MainController.embeddingSearch(req, res);
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
