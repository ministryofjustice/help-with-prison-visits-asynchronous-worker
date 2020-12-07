module.exports.getKeyByValue = function (enumeration, value) {
  let result = null
  Object.keys(enumeration).forEach(function (key) {
    const element = enumeration[key]
    if (typeof element === 'object' && element.value === value) {
      result = element
    }
  })
  return result
}
