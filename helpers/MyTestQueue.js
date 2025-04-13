"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyCurrentQueue = exports.MyTestQueue = void 0;
class MyTestQueue {
    constructor(concurrency) {
        this.isRunning = false;
        this.count = 0;
        this.listOfHandlers = [];
        this.listOfWaitingHandlers = [];
        this.concurrency = concurrency;
    }
    static channels(concurrency) {
        return new MyTestQueue(concurrency);
    }
    async addAndRun(f) {
        if (this.listOfHandlers.length < this.concurrency) {
            this.listOfHandlers.push(f);
            if (this.count < this.concurrency) {
                this.count++;
                this.runner();
            }
        }
        else if (this.listOfHandlers.length === this.concurrency) {
            this.listOfWaitingHandlers.push(f);
        }
    }
    async runner(f = this.listOfHandlers.shift()) {
        try {
            await f();
            // this.listOfHandlers.shift();
            // this.listOfHandlers.shift();
            if (this.listOfHandlers.length || this.listOfWaitingHandlers.length) {
                /**
                 * Добавляем из массива waiting. Одно место уже освободилось(shift выше)
                 */
                if (this.listOfWaitingHandlers.length) {
                    this.listOfHandlers.push(this.listOfWaitingHandlers.shift());
                }
                this.runner();
            }
            else {
                console.log("Нет функция для вызова!");
                console.log("Длин списка - " + this.listOfHandlers.length);
                this.count--;
                return;
            }
        }
        catch (e) {
            //   await LogService.log(message);
        }
    }
}
exports.MyTestQueue = MyTestQueue;
function doSomethingAsync(delay) {
    return timeoutPromise(delay);
}
function timeoutPromise(time) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(Date.now());
        }, time);
    });
}
function testQueue() {
    const q = MyTestQueue.channels(2);
    let start = Date.now();
    q.addAndRun(async () => {
        console.log("Начинаю запрос 1");
        const res = (await doSomethingAsync(1000));
        const res2 = (await doSomethingAsync(2000));
        console.log("Закончил запрос 1 - " + (res - start));
    });
    q.addAndRun(async () => {
        console.log("Начинаю запрос 2");
        // throw new Error("какая-то ошибка");
        const res = (await doSomethingAsync(1000));
        console.log("Закончил запрос 2 -" + (res - start));
    });
    q.addAndRun(async () => {
        console.log("Начинаю запрос 3");
        const res = (await doSomethingAsync(1000));
        console.log("Закончил запрос 3 - " + (res - start));
    });
}
class MyCurrentQueue {
    constructor() {
    }
    /**
     * Получить текущую очередь
     * @returns
     */
    static getService() {
        if (!this.currentQueue) {
            this.currentQueue = new MyTestQueue(1);
        }
        return this.currentQueue;
    }
}
exports.MyCurrentQueue = MyCurrentQueue;
MyCurrentQueue.currentQueue = null;
