# combine-async-error 的测试目录

##### 安排了三个测试用的接口请求方法，来对每个配置项进行测试

### 基本测试
```js
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
```
