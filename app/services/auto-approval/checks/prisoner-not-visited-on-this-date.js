const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'prisoner-not-visited-on-this-date'
const FAILURE_MESSAGE = 'A claim has already been made for this prisoner on this date'

module.exports = function (autoApprovalData) {
  let matchedCount = 0
  autoApprovalData.prisonNumbers.forEach(function (number) {
    if (number === autoApprovalData.Prisoner.PrisonNumber) {
      matchedCount += 1
    }
  })
  if (matchedCount > 1) {
    return new AutoApprovalCheckResult(CHECK_NAME, false, FAILURE_MESSAGE)
  }
  return new AutoApprovalCheckResult(CHECK_NAME, true, '')
}
