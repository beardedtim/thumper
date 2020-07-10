const thumper = require('./')

describe('thumper', () => {
  describe('isIterator', () => {
    it('returns true for values that are iterable', () => {
      const list = []
      const num = 1
      const string = '123'
      const obj = { key: 'value' }

      class CustomIterable {
        [Symbol.iterator]() {
          return this
        }
      }

      // Objects _might_  be iterable
      // A list is iterable
      expect(thumper.isIterator(list)).toBe(true)
      // Custom iterables are iterable
      expect(thumper.isIterator(new CustomIterable())).toBe(true)

      // An object is not iterable
      expect(thumper.isIterator(obj)).toBe(false)
      // but it can become one
      expect(thumper.isIterator(Object.entries(obj))).toBe(true)
      expect(thumper.isIterator(Object.values(obj))).toBe(true)
      expect(thumper.isIterator(Object.keys(obj))).toBe(true)


      // Primitives are not iterable  
      // a string is not iterable
      expect(thumper.isIterator(string)).toBe(false)
      // a number is not iterable
      expect(thumper.isIterator(num)).toBe(false)
    })
  })

  describe('all', () => {
    it('returns true if all values in the iterator pass the predicate', () => {
      const iterator = [1, 2, 3]
      const pred = num => num < 10
      const passed = thumper.all(pred, iterator)

      expect(passed).toBe(true)
    })

    it('returns false if any value in the iterator fails the predicate', () => {
      const iterator = [1, 2, 3]
      const pred = num => num > 10
      const passed = thumper.all(pred, iterator)

      expect(passed).toBe(false)
    })

    it('returns early at the first sign of failure', () => {
      const iterator = [1, 2, 3]
      const pred = jest.fn().mockReturnValue(false)
      const passed = thumper.all(pred, iterator)

      expect(passed).toBe(false)
      expect(pred).toHaveBeenCalledTimes(1)
    })

    it('throws an error if not given an iterator', () => {
      const notIter = 1
      const fn = () => { }

      expect(() => thumper.all(fn, notIter)).toThrow(TypeError)
    })
  })

  describe('any', () => {
    it('is the same thing as some', () => {
      expect(thumper.some).toBe(thumper.any)
    })
  })

  describe('some', () => {
    it('returns true if any values in the iterator pass the predicate', () => {
      const iterator = [1, 2, 3]
      const pred = num => num < 10
      const passed = thumper.some(pred, iterator)

      expect(passed).toBe(true)
    })

    it('returns false if all value in the iterator fails the predicate', () => {
      const iterator = [1, 2, 3]
      const pred = num => num > 10
      const passed = thumper.some(pred, iterator)

      expect(passed).toBe(false)
    })

    it('returns early at the first sign of success', () => {
      const iterator = [1, 2, 3]
      const pred = jest.fn().mockReturnValue(true)
      const passed = thumper.some(pred, iterator)

      expect(passed).toBe(true)
      expect(pred).toHaveBeenCalledTimes(1)
    })

    it('throws an error if not given an iterator', () => {
      const notIter = 1
      const fn = () => { }

      expect(() => thumper.some(fn, notIter)).toThrow(TypeError)
    })
  })

  describe('map', () => {
    it('returns a new iterator', () => {
      const iter = []
      const newIter = thumper.map(() => { }, iter)

      expect(thumper.isIterator(newIter)).toBe(true)
    })

    it('maps the values of the given iterator using the given mapping fn', () => {
      const iter = [1, 2, 3]
      const fn = num => num + 1
      const newIter = thumper.map(fn, iter)

      expect(thumper.collect(newIter)).toEqual([2, 3, 4])
    })

    it('throws when not given an iterator', () => {
      const notIter = 1
      const fn = () => { }

      expect(() => thumper.map(fn, notIter)).toThrow(TypeError)
    })
  })

  describe('filter', () => {
    it('returns an iterator', () => {
      const iter = []
      const fn = () => { }
      const newIter = thumper.filter(fn, iter)
      expect(thumper.isIterator(newIter)).toBe(true)
    })

    it('filters the given iterator by the given predicate', () => {
      const iter = [1, 2, 3]
      const pred = num => num === 2
      const newIter = thumper.filter(pred, iter)

      expect(thumper.collect(newIter)).toEqual([2])
    })

    it('throws when not given an iterator', () => {
      const notIter = 1
      const fn = () => { }

      expect(() => thumper.filter(fn, notIter)).toThrow(TypeError)
    })
  })

  describe('filter_map', () => {
    it('returns an iterator', () => {
      const iter = []
      const fn = () => { }
      const newIter = thumper.filter_map(fn, iter)
      expect(thumper.isIterator(newIter)).toBe(true)
    })

    it('maps the value at each iteration. If it returns truthy, it is returned', () => {
      const iter = [1, 2, 3]
      const pred = num => num === 2 ? 'haha' : false
      const newIter = thumper.filter_map(pred, iter)

      expect(thumper.collect(newIter)).toEqual(['haha'])
    })

    it('throws when not given an iterator', () => {
      const notIter = 1
      const fn = () => { }

      expect(() => thumper.filter_map(fn, notIter)).toThrow(TypeError)
    })
  })

  describe('chain', () => {
    it('returns an iterator', () => {
      const iter = []
      const iter2 = []
      const newIter = thumper.chain(iter, iter2)

      expect(thumper.isIterator(newIter)).toBe(true)
    })

    it('returns an iterator that is the iterators concated together', () => {
      const iter1 = [1]
      const iter2 = [2]
      const newIter = thumper.chain(iter1, iter2)

      expect(thumper.collect(newIter)).toEqual([1, 2])
    })

    it('throws if either input is not an iterator', () => {
      expect(() => thumper.chain([], 1)).toThrow(TypeError)
      expect(() => thumper.chain(1, [])).toThrow(TypeError)
    })
  })

  describe('collect', () => {
    it('returns an array', () => {
      const iter = thumper.map(v => v, [1])
      const collected = thumper.collect(iter)

      expect(Array.isArray(collected)).toBe(true)
      expect(Array.isArray(iter)).toBe(false)
    })

    it('throws if not given an iterator', () => {
      expect(() => thumper.collect(1)).toThrow(TypeError)
    })
  })

  describe('count', () => {
    it('returns the count of items in the iterator by consuming it', () => {
      const iter = [1, 2, 3]
      const count = thumper.count(iter)

      expect(count).toBe(3)
    })

    it('throws when not given an iterator', () => {
      expect(() => thumper.count(1)).toThrow(TypeError)
    })
  })

  describe('take', () => {
    it('returns an iterator', () => {
      const iter = [1, 2, 3]
      const next = thumper.take(3, iter)

      expect(thumper.isIterator(next)).toBe(true)
    })

    it('takes the n of items from the iterator', () => {
      const iter = [1, 2, 3]
      const next = thumper.take(2, iter)

      expect(thumper.collect(next)).toEqual([1, 2])
    })
  })

  describe('takeWhile', () => {
    it('returns an iterator', () => {
      const iter = [1, 2, 3]
      const next = thumper.takeWhile(() => { }, iter)

      expect(thumper.isIterator(next)).toBe(true)
    })

    it('takes the items of the iterator until the predicate returns false', () => {
      const iter = [1, 2, 3]
      const next = thumper.takeWhile(num => num < 2, iter)

      expect(thumper.collect(next)).toEqual([1])
    })
  })

  describe('cycle', () => {
    it('returns an iterator', () => {
      const iter = [1, 2, 3]
      const next = thumper.cycle(iter)
      expect(thumper.isIterator(next)).toBe(true)
    })

    it('returns an iterator that is a cylce of the passed in one', () => {
      const iter = [1, 2, 3]
      const cycled = thumper.cycle(iter)
      const next = thumper.take(10, cycled)

      expect(thumper.collect(next)).toEqual([
        1, 2, 3, 1, 2, 3, 1, 2, 3, 1
      ])
    })

    it('throws if not given an iterator', () => {
      expect(() => thumper.cycle(1)).toThrow(TypeError)
    })
  })

  describe('enumerate', () => {
    it('returns an iterator that contains both the item and the index', () => {
      const iter = [1, 2, 3]
      const next = thumper.enumerate(iter)
      expect(thumper.collect(next)).toEqual([
        [1, 0],
        [2, 1],
        [3, 2]
      ])
    })

    it('throws an error if not given an iterator', () => {
      expect(() => thumper.enumerate(1)).toThrow(TypeError)
    })
  })

  describe('eq_by', () => {
    it('returns true if the iterators passed in are equal given the predicate', () => {
      const iter1 = [1]
      const iter2 = [2]
      const pred = () => true
      expect(thumper.eq_by(pred, iter1, iter2)).toBe(true)
    })

    it('returns false if the iterators fail the predicate', () => {
      const iter1 = [1]
      const iter2 = [1]
      const pred = () => false

      expect(thumper.eq_by(pred, iter1, iter2)).toBe(false)
    })

    it('throws an error if not given iterators', () => {
      expect(() => thumper.eq_by(() => true, [1], 1)).toThrow(TypeError)
      expect(() => thumper.eq_by(() => true, 1, [1])).toThrow(TypeError)
    })
  })

  describe('eq', () => {
    it('returns true if the items in the iterator are strictly equal', () => {
      const value = {}
      const iter1 = [value]
      const iter2 = [value]

      expect(thumper.eq(iter1, iter2)).toBe(true)
    })

    it('returns false if the items in the iterator are not strictly equal', () => {
      const value = {}
      const iter1 = [{ ...value }]
      const iter2 = [{ ...value }]

      expect(thumper.eq(iter1, iter2)).toBe(false)
    })
  })

  describe('find', () => {
    it('returns the value from the iterator that first passed the predicate', () => {
      const iter = [1, 2, 3]
      const pred = num => num === 2
      expect(thumper.find(pred, iter)).toBe(2)
    })

    it('returns undefined if no value passed the iterator', () => {
      const iter = [1, 2, 3]
      const pred = num => num > 10
      expect(thumper.find(pred, iter)).not.toBeDefined()
    })

    it('throws if not given an iterator', () => {
      expect(() => thumper.find(() => true, 1)).toThrow(TypeError)
    })
  })

  describe('find_map', () => {
    it('returns the mapped value that passed the predicate', () => {
      const iter = [1, 2, 3]
      const predMap = num => num === 2 ? 'haha' : false

      expect(thumper.find_map(predMap, iter)).toBe('haha')
    })

    it('returns undefined if no mapped value passed the predicate', () => {
      const iter = [1, 2, 3]
      const predMap = num => num > 10 ? 'haha' : false

      expect(thumper.find_map(predMap, iter)).not.toBeDefined()
    })

    it('throws an error if not given an iterator', () => {
      expect(() => thumper.find_map(() => true, 1)).toThrow(TypeError)
    })
  })

  describe('flatMap', () => {
    it('maps the values given the function and resolves nested iterators', () => {
      const iter = [1, 2]
      const fn = num => [num, num]

      expect(thumper.collect(
        thumper.flatMap(fn, iter))
      ).toEqual([1, 1, 2, 2])
    })

    it('handles single values as well', () => {
      const iter = [1, 2]
      const fn = num => num + 1

      expect(thumper.collect(
        thumper.flatMap(fn, iter)
      )).toEqual([2, 3])
    })
  })

  describe('flatten', () => {
    it('flattens an iterable of iterables', () => {
      const iter = [[1], [2], [3]]
      const flattened = thumper.flatten(iter)

      expect(thumper.collect(flattened)).toEqual([1, 2, 3])
    })

    it('works with non-nested values as well', () => {
      const iter = [[1], 2, [3]]
      const flattened = thumper.flatten(iter)

      expect(thumper.collect(flattened)).toEqual([1, 2, 3])
    })

    it('throws if not given an iterable', () => {
      expect(() => thumper.flatten(1)).toThrow(TypeError)
    })
  })

  describe('tap', () => {
    it('calls the given function for each item and passes the item on', () => {
      const iter = [1, 2, 3]
      const fn = jest.fn()
      const next = thumper.tap(fn, iter)

      expect(thumper.collect(next)).toEqual([1, 2, 3])

      expect(fn).toHaveBeenNthCalledWith(1, 1)
      expect(fn).toHaveBeenNthCalledWith(2, 2)
      expect(fn).toHaveBeenNthCalledWith(3, 3)

      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('throws an error if not given an iterator', () => {
      expect(() => thumper.tap(() => { }, 1)).toThrow(TypeError)
    })
  })

  describe('insepct', () => {
    it('is the same thing as tap', () => {
      expect(thumper.tap).toBe(thumper.inspect)
    })
  })

  describe('nth', () => {
    it('returns the value at that "index", starting from 0', () => {
      const iter = [1, 2, 3]
      const n = 1

      expect(thumper.nth(n, iter)).toBe(2)
    })

    it('returns undefined if given a value outside the iterator count', () => {
      const iter = []
      expect(thumper.nth(0, iter)).not.toBeDefined()
    })

    it('throws an error if not given an iterator', () => {
      expect(() => thumper.nth(1, 1)).toThrow(TypeError)
    })
  })

  describe('fold', () => {
    it('returns the final value after walking the iterator', () => {
      const iter = [1, 2, 3]
      const fn = (a, c) => a + c
      const value = thumper.fold(fn, 0, iter)

      expect(value).toBe(6)
    })

    it('throws an error if not given an iterator', () => {
      expect(() => thumper.fold(() => { }, 1, 1)).toThrow(TypeError)
    })
  })

  describe('scan', () => {
    it('returns an iterator of the folded values instead of a single fold value', () => {
      const iter = [1, 2, 3]
      const fn = (a, c) => a + c
      const scan = thumper.scan(fn, 0, iter)

      expect(thumper.collect(scan)).toEqual([
        1, 3, 6
      ])
    })
  })

  describe('skipWhile', () => {
    it('returns an iterator that skips items while the predicate returns true', () => {
      const iter = [1, 2, 3]

      let count = 0

      const pred = () => {
        count++
        return count <= 2
      }

      const skipped = thumper.skipWhile(pred, iter)

      expect(thumper.collect(skipped)).toEqual([3])
    })

    it('throws if not given an iterator', () => {
      expect(() => thumper.skipWhile(() => true, 1)).toThrow(TypeError)
    })
  })

  describe('skip', () => {
    it('skips the given number of values', () => {
      const iter = [1, 2, 3]
      const skipped = thumper.skip(2, iter)

      expect(thumper.collect(skipped)).toEqual([3])
    })
  })

  describe('zip', () => {
    it('zips two iterators together', () => {
      const iter1 = [1, 2]
      const iter2 = [3, 4]
      const zipped = thumper.zip(iter1, iter2)

      expect(thumper.collect(zipped)).toEqual([1, 3, 2, 4])
    })
  })

  describe('empty', () => {
    it('returns an empty iterator', () => {
      expect(thumper.isIterator(thumper.empty())).toBe(true)
      expect(thumper.collect(thumper.empty())).toEqual([])
    })
  })

  describe('once', () => {
    it('returns an iterator with one value, being the passed in value', () => {
      const once = thumper.once(1)

      expect(thumper.collect(once)).toEqual([1])
    })
  })

  describe('repeate', () => {
    it('returns an iterator of the value repeated indefinitely', () => {
      const iter = thumper.repeat(1)
      const only1 = thumper.take(1, iter)

      expect(thumper.collect(only1)).toEqual([1])
    })
  })
})