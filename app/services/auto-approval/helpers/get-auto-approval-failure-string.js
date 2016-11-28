module.exports = function (checks) {
  var output = []

  checks.forEach(function (check) {
    if (!check.result) {
      output.push(check.failureMessage)
    }
  })

  return output
}
