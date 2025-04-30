module.exports.getKeyByValue = (enumeration, value) => {
  let result = null
  Object.keys(enumeration).forEach(key => {
    const element = enumeration[key]
    if (typeof element === 'object' && element.value === value) {
      result = element
    }
  })
  return result
}
