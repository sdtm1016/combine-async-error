const combineAsyncError = require("../index.cjs")

function requestJL() {
    return new Promise((res, rej) => {
        if (a[0]) {
            res("200")
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
    combineAsyncError([requestJL, requestSD, requestYN], {}).then(res => {
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
