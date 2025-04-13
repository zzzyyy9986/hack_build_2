"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GigaHelper = exports.getToken = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../env");
const getToken = async () => {
    const { v4: uuidv4 } = require("uuid");
    const qs = require("qs");
    const axios = require("axios");
    let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://ngw.devices.sberbank.ru:9443/api/v2/oauth",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            RqUID: uuidv4(),
            Authorization: `Basic ${env_1.gigaClientId}`,
        },
        data: qs.stringify({
            scope: env_1.gigaScope,
        }),
    };
    try {
        const response = await axios(config);
        const { access_token: accessToken, expires_at: expiresAt } = response.data;
        return { accessToken, expiresAt };
    }
    catch (error) {
        console.log(error);
    }
};
exports.getToken = getToken;
class GigaHelper {
    /**
     * Сделать запрос к gigaChat
     * @param content
     * @param system
     */
    static async gigaQuery(content = "", system = "") {
        // if (!content) return;
        const token = await (0, exports.getToken)();
        const messages = [];
        if (system) {
            messages.push({ role: "system", content: system });
        }
        const data = JSON.stringify({
            model: "GigaChat",
            messages: messages.concat([
                {
                    role: "user",
                    content,
                },
            ]),
            profanity_check: true,
            // temperature: 1,
            // top_p: 0.4,
            // n: 2,
            // stream: false,
            max_tokens: 512,
            // repetition_penalty: 1,
            // update_interval: 0,
        });
        const config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://gigachat.devices.sberbank.ru/api/v1/chat/completions",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token.accessToken}`,
            },
            data,
        };
        try {
            const response = await (0, axios_1.default)(config);
            return response.data;
            const message = response.data.choices[0].message;
            return message.content;
        }
        catch (e) {
            console.log("Ошибка!!!!!");
            console.log(e);
        }
    }
    static async getGigaEmbedings(text) {
        const axios = require("axios");
        const token = await (0, exports.getToken)();
        let data = JSON.stringify({
            model: "Embeddings",
            input: text,
        });
        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://gigachat.devices.sberbank.ru/api/v1/embeddings",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: "Bearer " + token.accessToken,
            },
            data: data,
        };
        try {
            const gigaResp = await axios(config);
            if (gigaResp.data) {
                return gigaResp.data;
            }
        }
        catch (e) {
            console.log(e);
        }
    }
}
exports.GigaHelper = GigaHelper;
