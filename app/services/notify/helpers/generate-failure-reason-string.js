module.exports = function (checks) {
  var result = []
  var newLine = '\r\n'

  checks.forEach(function (check) {
    if (!check.result) {
      result.push(check.failureMessage)
    }
  })

  return result.join(newLine)
}
