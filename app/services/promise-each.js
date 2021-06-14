// https://stackoverflow.com/a/41608207
Promise.each = function (arr, fn) {
  if (!Array.isArray(arr)) {
    return Promise.reject(new Error('Non array passed to each'))
  }

  if (arr.length === 0) {
    return Promise.resolve()
  }

  return arr.reduce(function (prev, cur) {
    return prev.then(() => fn(cur))
  }, Promise.resolve())
}
