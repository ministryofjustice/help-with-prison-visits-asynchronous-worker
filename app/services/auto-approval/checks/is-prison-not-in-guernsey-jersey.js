const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')
const enumHelper = require('../../../constants/helpers/enum-helper')
const guernseyJerseyPrisonsEnum = require('../../../constants/guernsey-jersey-prisons-enum')

const CHECK_NAME = 'is-prison-not-in-guernsey-jersey'
const FAILURE_MESSAGE = 'The prison being visited by this claimant is located in either Guernsey or Jersey'

module.exports = function (autoApprovalData) {
  var prisonName = autoApprovalData.Prisoner.NameOfPrison

  if (!enumHelper.getKeyByValue(guernseyJerseyPrisonsEnum, prisonName)) {
    return new AutoApprovalCheckResult(CHECK_NAME, true, '')
  } else {
    return new AutoApprovalCheckResult(CHECK_NAME, false, FAILURE_MESSAGE)
  }
}
