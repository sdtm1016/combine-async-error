const combineAsyncError = (awaits, config = { pipes: {} }) => {
    const checkType = data => Object.prototype.toString.call(data).slice(8, -1) === 'Object'
    const init = v => ({ func: v, args: [], callback: Function.prototype })
    if (typeof awaits === 'function') awaits = [awaits]
    const tasks = awaits.map(v => checkType(v) ? { ...init(v), ...v } : init(v))
    const doGlide = { node: null, out: null, times: 0, data: { result: [], error: null } }
    const push = v => {
        const { node, data, out } = doGlide
        data.result.push(v)
        if (node.next().done) out(data)
    }
    const operations = {
        pipes: result => {
            const { single, whole } = config.pipes
            if (whole) return { isNeedPreArg: true, preReturn: result }
            if (!single) return { isNeedPreArg: false }
            const pLen = result.length - 1
            const preReturn = result[pLen > 0 ? pLen : 0]
            return { isNeedPreArg: true, preReturn }
        },
        forever: error => {
            const { forever } = config
            if (!forever) return true
            const funcName = tasks[doGlide.times - 1].func.name
            push({ flag: false, data: { msg: error, funcName } })
        }
    }
    const noErrorAwait = async bar => {
        try {
            const { isNeedPreArg, preReturn } = operations.pipes(doGlide.data.result)
            const { func, args, callback } = bar
            const msg = isNeedPreArg ? await func(preReturn, ...args) : await func(...args)
            callback(msg)
            push({ flag: true, data: { msg } })
        } catch (error) {
            const { times, data } = doGlide
            const t = times - 1
            if (config.alwaysFunc) tasks[t].callback(error)
            if (!operations.forever(error)) return
            const funcName = tasks[t].func.name
            doGlide.out({ ...data, error: { msg: error, funcName } })
        }
    }
    const handler = out => {
        doGlide.node = (function* () {
            doGlide.out = out
            const len = tasks.length
            while (doGlide.times < len)
                yield noErrorAwait(tasks[doGlide.times++])
        })()
        doGlide.node.next()
    }
    const letsGo = new Promise(out => handler(out))
    const { acc } = config
    if (!acc) return letsGo
    letsGo.then(v => acc(v))
}
export default combineAsyncError
