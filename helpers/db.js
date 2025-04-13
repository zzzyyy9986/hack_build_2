"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConn = exports.DBConnection = void 0;
const env_1 = require("../../src/env");
const mysql2_1 = __importDefault(require("mysql2"));
const dotenv = require("dotenv");
dotenv.config();
// const mysql = require("mysql2");
// like ENUM
const HttpStatusCodes = {
    "422": "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD",
    "409": "ER_DUP_ENTRY",
};
class DBConnection {
    constructor() {
        this.db = mysql2_1.default.createPool({
            host: env_1.DB_HOST,
            user: env_1.DB_USER_NAME,
            password: env_1.DB_PASS,
            database: env_1.DB_NAME,
        });
        this.checkConnection();
    }
    checkConnection() {
        // @ts-ignore
        this.db.getConnection((err, connection) => {
            if (err) {
                if (err.code === "PROTOCOL_CONNECTION_LOST") {
                    console.error("Database connection was closed.");
                }
                if (err.code === "ER_CON_COUNT_ERROR") {
                    console.error("Database has too many connections.");
                }
                if (err.code === "ECONNREFUSED") {
                    console.error("Database connection was refused.");
                }
            }
            if (connection) {
                connection.release();
            }
            return;
        });
    }
    async query(sql, values) {
        return new Promise((resolve, reject) => {
            const callback = (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            };
            // execute will internally call prepare and query
            return this.db.execute(sql, values, callback);
        }).catch((err) => {
            const mysqlErrorList = Object.keys(HttpStatusCodes);
            // convert mysql errors which in the mysqlErrorList list to http status code
            err.status = mysqlErrorList.includes(err.code)
                ? HttpStatusCodes[err.code]
                : err.status;
            throw err;
        });
    }
}
exports.DBConnection = DBConnection;
exports.dbConn = new DBConnection();
