const isIterator = possible => {
  try {
    return Symbol.iterator in possible
  } catch (e) {
    if (e.message.indexOf("Cannot use 'in' operator to search for") > -1) {
      return false
    } else {
      throw e
    }
  }
}

class NotIterator extends TypeError {
  code = 1
  message = 'Value is not an iterator'
}

const ensureIterator = value => {
  if (!isIterator(value)) {
    throw new NotIterator()
  }
}

const curry = fn => (...args) => {
  if (args.length >= fn.length) {
    return fn(...args)
  } else {
    return (...other) => curry(fn)(...args, ...other)
  }
}

/**
 * Maps over an iterator, calling the transformation
 * function on each item
 * 
 * @type {function(function(*): *, Iterable<*>): Iterable<*>}
 */
const map = curry((fn, iter) => {
  ensureIterator(iter)

  function* it() {
    for (const item of iter) {
      yield fn(item)
    }
  }

  return it()
})
/**
 * Filters an iterable, given the predicate
 *
 * @type {function(function(*): boolean, Iterable<*>): Iterable<*>}
 */
const filter = curry((pred, iterator) => {
  ensureIterator(iterator)

  function* it() {
    for (const item of iterator) {
      if (pred(item)) {
        yield item
      }
    }
  }

  return it()
})

/**
 * Maps over the iterable, including any items that when transformed
 * return truthy
 *
 * @type {function(function(*): *, Iterable<*>): Iterable<*>}
 */
const filter_map = curry((predMap, iterator) => {
  ensureIterator(iterator)


  function* it() {
    for (const item of iterator) {
      const result = predMap(item)
      if (result) {
        yield result
      }
    }
  }

  return it()
})

/**
 * Checks to see if every item of the iterator passed the predicate
 * 
 * Bails early
 *
 * @type {function(function(*): *, Iterable<*>): boolean}
 */
const all = curry((pred, iterator) => {
  ensureIterator(iterator)


  for (const item of iterator) {
    if (!pred(item)) {
      return false
    }
  }

  return true
})

/**
 * Checks to see if any item of the iterator passed the predicate
 *
 * Bails early
 *
 * @type {function(function(*): *, Iterable<*>): boolean}
 */
const some = curry((pred, iterator) => {
  ensureIterator(iterator)


  for (const item of iterator) {
    if (pred(item)) {
      return true
    }
  }

  return false
})

/**
 * Chains together the given iterators
 *
 * @type {Iterable<*>, Iterable<*>): Iterable<*>}
 */
const chain = curry((iter1, iter2) => {
  ensureIterator(iter1)
  ensureIterator(iter2)


  function* it() {
    yield* iter1
    yield* iter2
  }

  return it()
})

/**
 * Collects an iterable into an array
 * @param {Iterable<*>} iter The iterator to collect
 * @returns {Array<*>}
 */
const collect = iter => {
  ensureIterator(iter)

  return [...iter]
}

/**
 * Counts the items in the iterator. Consumes the iterator
 * 
 * @param {Iterable<*>} iter The iterator to count
 * @returns {number}
 */
const count = iter => {
  ensureIterator(iter)

  let i = 0
  for (const _ of iter) {
    i++
  }

  return i
}

/**
 * Takes items from the iterator until the
 * predicate returns falsey
 * 
 * @type {function(function(*): boolean, Iterable<*>): Iterable<*>}
 */
const takeWhile = curry((pred, iter) => {
  ensureIterator(iter)

  function* it() {
    for (const item of iter) {
      if (pred(item)) {
        yield item
      } else {
        break
      }
    }
  }

  return it()
})

/**
 * Takes the designated amount of items from the iterable
 *
 * @type {function(number, Iterable<*>): Iterable<*>}
 */
const take = curry((num, iter) => {
  let count = 0

  const pred = () => {
    count++

    return count < num + 1
  }

  return takeWhile(pred, iter)
})

/**
 * Repeats the given iterable
 * @param {Iterable<*>} iter The iterator to repeate
 * @returns {Iterable<*>}
 */
const cycle = iter => {
  const item = collect(iter)

  function* it() {
    let i = 0;

    while (true) {
      if (i > item.length - 1) {
        i = 0
      }

      yield item[i]
      i++
    }
  }

  return it()
}

/**
 * Adds an index to each iterator
 * @param {Iterable<*>} iter The iterator to enumerate
 * @returns {Iterable<[number, *]>} 
 */
const enumerate = iter => {
  ensureIterator(iter)

  function* it() {
    let i = 0;
    for (const item of iter) {
      yield [item, i]
      i++
    }
  }

  return it()
}

/**
 * Checks to see if two iterators are of equal value
 * by testing them against the predicate
 * 
 * @type {function(function(*, *): boolean, Iterable<*>, Iterable<*>): boolean}
 */
const eq_by = curry((pred, iter1, iter2) => {
  ensureIterator(iter1)
  ensureIterator(iter2)

  const iter1Iter = map(v => v, iter1)
  const iter2Iter = map(v => v, iter2)


  for (const item of iter1Iter) {
    const { value, done } = iter2Iter.next()

    if (!pred(item, value) || done) {
      return false
    }
  }

  return true
})

/**
 * Checks to see if the iterators values are strictly equal
 * 
 * @type {function(Iterable<*>, Iterable<*>): boolean}
 */
const eq = eq_by((a, b) => a === b)

/**
 * Finds the value in the iterable that passes the predicate
 * 
 * @type {function(function((*): boolean, Iterable<*>): *)}
 */
const find = curry((pred, iter) => {
  ensureIterator(iter)

  for (const item of iter) {
    if (pred(item)) {
      return item
    }
  }
})

/**
 * Finds the value in the iterable that passes the predicate after
 * being mapped
 * 
 * @type {function(function(*): *, Iterable<*>): *}
 */
const find_map = curry((predMap, iter) => {
  ensureIterator(iter)

  for (const item of iter) {
    const result = predMap(item)
    if (result) {
      return result
    }
  }
})

/**
 * Flattens the values inside of the iterable after
 * transforming each item
 * 
 * @type {function(function(*): *, Iterable<*>): Iterable<*>}
 */
const flatMap = curry((fn, iter) => {
  ensureIterator(iter)

  function* it() {
    for (const item of iter) {
      const result = fn(item)

      if (isIterator(result)) {
        yield* result
      } else {
        yield result
      }
    }
  }

  return it()
})

/**
 * Flattens the array without any transformation
 * 
 * @type {function(function(*): *, Iterable<*>): Iterable<*>}
 */
const flatten = flatMap(value => value)

/**
 * Calls the given function for each item without transforming it
 * 
 * @type {function(function(*): void, Iterable<*>): Iterable<*>}
 */
const tap = curry((fn, iter) => {
  ensureIterator(iter)

  function* it() {
    for (const item of iter) {
      fn(item)
      yield item
    }
  }

  return it()
})

/**
 * Gets the given index value from the iterable
 * 
 * @type {function(number, Iterable<*>): Iterable<*>}
 */
const nth = curry((index, iter) => {
  ensureIterator(iter)

  let i = 0;
  for (const item of iter) {
    if (i === index) {
      return item
    }
    i++
  }
})

/**
 * Folds the given iterable by the given accumulator function
 * 
 * @type {function(function(*, *): *, *, Iterable<*>): *}
 */
const fold = curry((fn, start, iter) => {
  ensureIterator(iter)

  let state = start

  for (const item of iter) {
    state = fn(state, item)
  }

  return state
})

/**
 * Returns an iterable by transforming the previous
 * and current values at each index
 * 
 * @type {function(function(*, *): *, *, Iterable<*>): Iterable<*>}
 */
const scan = curry((fn, start, iter) => {
  ensureIterator(iter)

  function* it() {
    let state = start
    for (let item of iter) {
      state = fn(state, item)
      yield state
    }
  }

  return it()
})

/**
 * Skips until the predicate returns falsey
 * 
 * @type {function(function(*): boolean, Iterable<*>): Iterable<*>}
 */
const skipWhile = curry((pred, iter) => {
  ensureIterator(iter)

  function* it() {
    let done = false
    for (const item of iter) {
      const passed = pred(item)
      if (!done && passed) {
        continue
      } else if (!passed) {
        done = true
      }

      yield item
    }
  }

  return it()
})

/**
 * Skips the designated amount of items
 * 
 * @type {function(number, Iterable<*>): Iterable<*>}
 */
const skip = curry((num, iter) => {
  let count = 0
  const pred = () => {
    count++

    return count <= num
  }

  return skipWhile(pred, iter)
})

/**
 * Zips two iterables together
 * 
 * @type {function(Iterable<*>, Iterable<*>): Iterable<*>}
 */
const zip = curry((iter1, iter2) => {
  ensureIterator(iter1)
  ensureIterator(iter2)
  // sometimes they give us an iterator-like thing
  // so we need to make sure we get an actual
  // iterator
  const ensuredIter = map(v => v, iter2)

  function* it() {
    for (const item of iter1) {
      yield item
      const item2 = ensuredIter.next()
      if (!item2.done) {
        yield item2.value
      }
    }
  }

  return it()
})

/**
 * Returns an empty Iterator
 * 
 * @returns {Iterable<void>}
 */
const empty = () => {
  function* it() {

  }

  return it()
}

/**
 * Creates an iterator of count 1 out of the item given
 * @param {*} item The item to turn into an iterator
 * @returns {Iterable<*>}
 */
const once = item => {
  function* it() {
    yield item
  }

  return it()
}

/**
 * Creates a cycle iterator of the value
 * @param {*} value The value to repeat
 * @returns {Iterable<*>}
 */
const repeat = value => cycle(once(value))

module.exports = {
  isIterator,
  all,
  any: some,
  some,
  chain,
  collect,
  count,
  map,
  filter,
  filter_map,
  take,
  takeWhile,
  cycle,
  enumerate,
  eq_by,
  eq,
  find,
  find_map,
  flatMap,
  flatten,
  tap,
  inspect: tap,
  nth,
  fold,
  scan,
  skipWhile,
  skip,
  zip,
  empty,
  once,
  repeat
}