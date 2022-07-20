const combineAsyncError = require("../index.cjs")

function requestJL(agv) {
    return new Promise((res, rej) => {
        if (a[0]) {
            res(agv + "200")
        } else {
            rej("吉林")
        }
    })
}

function requestSD() {
    return new Promise((res, rej) => {
        if (a[1]) {
            res("300")
        } else {
            rej("山东")
        }
    })
}

function requestYN() {
    return new Promise((res, rej) => {
        if (a[2]) {
            res("400")
        } else {
            rej("云南")
        }
    })
}

var a = [true, false, true]
test("基本测试", () => {
    combineAsyncError([requestJL, requestSD, requestYN]).then(res => {
        expect(res).toEqual({
            result: [
                {
                    flag: true,
                    data: {
                        msg: "200"
                    }
                }
            ],
            error: {
                msg: "山东",
                funcName: "requestSD"
            }
        })
    })
})

test("不同参数测试", () => {
    combineAsyncError([
        requestJL,
        {
            func: requestSD,
            args: ["火车票价格："],
            callback: res => {
                console.log(res)
            }
        },
        requestYN
    ]).then(res => {
        expect(res).toEqual({
            result: [
                {
                    flag: true,
                    data: {
                        msg: "火车票价格：200"
                    }
                }
            ],
            error: {
                msg: "山东",
                funcName: "requestSD"
            }
        })
    })
})

test("forever 配置项测试", () => {
    combineAsyncError([requestJL, requestSD, requestYN], {
        forever: true
    }).then(res => {
        expect(res).toEqual({
            result: [
                {
                    flag: true,
                    data: {
                        msg: "200"
                    }
                },
                {
                    flag: false,
                    data: {
                        msg: "山东",
                        funcName: "requestSD"
                    }
                },
                {
                    flag: true,
                    data: {
                        msg: "400"
                    }
                }
            ],
            error: null
        })
    })
})
