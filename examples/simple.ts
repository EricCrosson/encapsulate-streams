import encapsulateStreams from '../src/encapsulate-streams'
import { Readable, Transform, Writable } from 'readable-stream'

function readable<O>(f: () => O): Readable {
    return new Readable({
        objectMode: true,
        read() {
            this.push(f())
        }
    })
}

function transform<I, O>(f: (chunk: I) => O): Transform {
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

function writable<I, O>(f: (chunk: I) => O): Writable {
    return new Writable({
        objectMode: true,
        write(chunk: I, _: string, callback: (error?: Error | null) => void) {
            f(chunk)
            callback()
        }
    })
}

function main() {

    const elements = [0, 1, 2, 3, null]
    let index = 0
    const source = readable(() => elements[index++])

    const transform1 = transform((value: number) => value + 1)
    const transform2 = transform((value: number) => value * 10)

    const witness: number[] = []
    const sink = writable((value: number) => witness.push(value))

    const stream = encapsulateStreams(transform1, transform2)
    source.pipe(stream).pipe(sink)

    sink.on('finish', () => {
        console.log(witness)
    })

}

main()
//=>[ 10, 20, 30, 40 ]
