module.exports = function (checks) {
  var output = []
  var newLine = '\r\n'

  checks.forEach(function (check) {
    if (!check.result) {
      output.push(check.failureMessage)
    }
  })

  return output.join(newLine)
}
