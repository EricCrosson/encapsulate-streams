/**
 * encapsulate-streams
 * Offer a pipeline of multiple streams as a single, encapsulating stream
 */

import { Transform, Writable, PassThrough } from 'readable-stream'
import makeBarrier from '@strong-roots-capital/barrier'


/**
 * Encapsulate multiple transform-streams as a single, encapsulating
 * transform stream.
 *
 * @param streams Streams to encapsulate
 * @returns A transform-stream encapsulating given streams
 */
export default function encapsulateStreams(
    ...streams: Transform[]
): Transform {

    const source = streams[0]
    const sink = streams[streams.length -1]

    if (streams.length === 0) {
        return new PassThrough({objectMode: true})
    }

    if (streams.length === 1) {
        return source
    }

    let barrier = makeBarrier()

    const projector = new Transform({objectMode: true})

    const inspector = new Writable({
        objectMode: true,
        write(chunk: any, _: string, callback: (error?: Error | null) => void) {
            barrier(chunk)
            callback()
        }
    })

    streams.reduce((source, sink) => (source.pipe(sink), sink))
    projector.pipe(source)
    sink.pipe(inspector)

    return new Transform({
        objectMode: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transform(chunk: any, _: string, callback: (error?: Error, data?: any) => void) {
            projector.push(chunk)
            barrier().then(([value]) => {
                barrier = makeBarrier()
                this.push(value)
                callback()
            })
        }
    })
}
