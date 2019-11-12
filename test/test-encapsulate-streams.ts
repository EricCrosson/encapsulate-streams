import test from 'ava'
import isStream from 'is-stream'
import { readable, transform, writable } from './utils'
import { until } from '@strong-roots-capital/until'

/**
 * Library under test
 */

import encapsulateStreams from '../src/encapsulate-streams'

test('should behave as the identity function when passed a single transform stream', t => {
    const stream = transform(() => null)
    t.deepEqual(stream, encapsulateStreams(stream))
})

test('should act as a pass-through stream when passed no arguments', async t => {
    const elements = [0, 1, 2, 3, null] as const
    const witness: number[] = []
    let index = 0
    const source = readable(() => elements[index++])

    const sink = writable((value: number) => witness.push(value))

    const stream = encapsulateStreams()
    t.true(isStream.transform(stream))

    source.pipe(stream).pipe(sink)
    await until(sink, 'finish')

    t.deepEqual([0, 1, 2, 3], witness)
})

test('should return an encapsulating transform-stream when passed multiple transforms', async t => {
    const elements = [0, 1, 2, 3, null] as const
    const witness: number[] = []
    let index = 0
    const source = readable(() => elements[index++])

    const trans1 = transform((value: number) => value + 1)
    const trans2 = transform((value: number) => value * 10)

    const sink = writable((value: number) => witness.push(value))

    const stream = encapsulateStreams(trans1, trans2)
    t.true(isStream.transform(stream))

    source.pipe(stream).pipe(sink)
    await until(sink, 'finish')

    t.deepEqual([10, 20, 30, 40], witness)
})
