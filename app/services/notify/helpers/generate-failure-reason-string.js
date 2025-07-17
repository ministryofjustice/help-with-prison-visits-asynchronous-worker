module.exports = checks => {
  const result = []
  const newLine = '<br />'

  checks.forEach(check => {
    if (!check.result) {
      result.push(`* ${check.failureMessage}`)
    }
  })

  return result.join(newLine)
}
