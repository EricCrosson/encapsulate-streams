import { Readable, Transform, Writable } from 'readable-stream'

export function readable<O>(f: () => O): Readable {
    return new Readable({
        objectMode: true,
        read() {
            this.push(f())
        }
    })
}

export function transform<I, O>(f: (chunk: I) => O): Transform {
    return new Transform({
        objectMode: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transform(chunk: I, _: string, callback: (error?: Error, data?: any) => void) {
            const result: O = f(chunk)
            this.push(result)
            callback()
        }
    })
}

export function writable<I, O>(f: (chunk: I) => O): Writable {
    return new Writable({
        objectMode: true,
        write(chunk: I, _: string, callback: (error?: Error | null) => void) {
            f(chunk)
            callback()
        }
    })
}
