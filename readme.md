
encapsulate-streams [![Build status](https://travis-ci.org/EricCrosson/encapsulate-streams.svg?branch=master)](https://travis-ci.org/EricCrosson/encapsulate-streams) [![npm version](https://img.shields.io/npm/v/encapsulate-streams.svg)](https://npmjs.org/package/encapsulate-streams) [![codecov](https://codecov.io/gh/EricCrosson/encapsulate-streams/branch/master/graph/badge.svg)](https://codecov.io/gh/EricCrosson/encapsulate-streams)
====================================================================================================================================================================================================================================================================================================================================================================================================================================================

> Offer a pipeline of multiple transform streams as a single, encapsulating transform stream

Install
-------

```shell
npm install encapsulate-streams
```

Use
---

```typescript
import encapsulateStreams from 'encapsulate-streams'
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
        write(chunk: I, _: string, callback: (error?: Error \| null) => void) {
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
```

## Index

### Functions

* [encapsulateStreams](#encapsulatestreams)

---

## Functions

<a id="encapsulatestreams"></a>

###  encapsulateStreams

▸ **encapsulateStreams**(...streams: *`Transform`[]*): `Transform`

*Defined in [encapsulate-streams.ts:16](https://github.com/EricCrosson/encapsulate-streams/blob/8d3f50b/src/encapsulate-streams.ts#L16)*

Encapsulate multiple transform-streams as a single, encapsulating transform stream.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| `Rest` streams | `Transform`[] |  Streams to encapsulate |

**Returns:** `Transform`
A transform-stream encapsulating given streams

___

