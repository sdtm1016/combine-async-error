const combineAsyncError = (awaits, config = { pipes: {} }) => {
    const rightType = { 'Array': 'Array: []', 'Object': 'Object: {}', 'Function': 'Function: () => void' }
    const redAlert = (c, t) => { throw TypeError(`${c} is not type ${rightType[t]}`) }
    const combineAsyncErrorArgs = [
        [awaits, 'Array', () => { redAlert(awaits, 'Array') }],
        [config, 'Object', () => { redAlert(config, 'Object') }],
    ]
    const checkType = (data, type) => Object.prototype.toString.call(data).slice(8, -1) === type
    combineAsyncErrorArgs.forEach(([t, r, f]) => !checkType(t, r) ? f() : null)
    const init = v => ({ func: v, args: [], callback: Function.prototype })
    const signleArgs = {
        'func': v => !checkType(v, 'Function') ? redAlert(v, 'Function') : null,
        'args': v => !checkType(v, 'Array') ? redAlert(v, 'Array') : null,
        'callback': v => !checkType(v, 'Function') ? redAlert(v, 'Function') : null,
    }
    const proxy = new Proxy(signleArgs, { get() { return Function.prototype } })
    signleArgs.__proto__ = proxy
    const tasks = awaits.map(v => {
        if (checkType(v, 'Object')) {
            const o = Object.keys(v)
            o.forEach(key => signleArgs[key](v[key]))
            return { ...init(v), ...v }
        }
        signleArgs.func(v)
        return init(v)
    })
    const doGlide = { node: null, out: null, times: 0, data: { result: [], error: null } }
    const push = v => doGlide.data.result.push(v) && doGlide.node.next()
    const operations = {
        pipes: result => {
            const { single, whole } = config.pipes
            if (whole) return { isNeedPreArg: true, preReturn: result }
            if (!single) return { isNeedPreArg: false }
            const preReturn = result[result.length - 1]
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
        doGlide.out = out
        doGlide.node = (function* () {
            const len = tasks.length
            while (doGlide.times < len)
                yield noErrorAwait(tasks[doGlide.times++])
            doGlide.out(doGlide.data)
        })()
        doGlide.node.next()
    }
    const letsGo = new Promise(out => handler(out))
    const { acc } = config
    if (!acc) return letsGo
    letsGo.then(v => acc(v))
}
export default combineAsyncError
