module.exports = function (checks) {
  const result = []
  const newLine = '<br />'

  checks.forEach(function (check) {
    if (!check.result) {
      result.push(`* ${check.failureMessage}`)
    }
  })

  return result.join(newLine)
}
