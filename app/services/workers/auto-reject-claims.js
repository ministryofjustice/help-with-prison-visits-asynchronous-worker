const moment = require('moment')
const getAutoRejectClaims = require('../data/get-auto-reject-claim')
const insertClaimEventSystemMessage = require('../data/insert-claim-event-system-message')
const updateClaimStatus = require('../data/update-claim-status')
const insertTask = require('../data/insert-task')
const tasks = require('../../constants/tasks-enum')
const statusEnum = require('../../constants/status-enum')
const claimEventEnum = require('../../constants/claim-event-enum')
const config = require('../../../config')
const log = require('../log')
require('../promise-each')

const autoRejectClaims = function () {
  log.info('Auto reject claims')
  const numberOfDaysAfterFinalReminderForRejection = parseInt(
    config.NUMBER_OF_DAYS_AFTER_FINAL_REMINDER_FOR_REJECTION,
    10,
  )
  const autoRejectClaimsOlderThan = moment()
    .startOf('day')
    .subtract(numberOfDaysAfterFinalReminderForRejection, 'days')
    .format('YYYY-MM-DD')

  return getAutoRejectClaims(autoRejectClaimsOlderThan).then(function (claimData) {
    return Promise.each(claimData, function (claim) {
      return insertClaimEventSystemMessage(
        claim.Reference,
        claim.EligibilityId,
        claim.ClaimId,
        null,
        claimEventEnum.CLAIM_REJECTED.value,
        null,
        'We have not had an update for 6 weeks or more. Rejecting the claim.',
        false,
      ).then(function () {
        return updateClaimStatus(claim.ClaimId, statusEnum.REJECTED).then(function () {
          return insertTask(
            claim.Reference,
            claim.EligibilityId,
            claim.ClaimId,
            tasks.REJECT_CLAIM_NOTIFICATION,
            claim.EmailAddress,
          )
        })
      })
    })
  })
}

module.exports = {
  autoRejectClaims,
}
