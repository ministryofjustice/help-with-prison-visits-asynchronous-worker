const { getDatabaseConnector } = require('../../databaseConnector')
const dateFormatter = require('../date-formatter')
const log = require('../log')

const autoApproveClaimExpenses = require('./auto-approve-claim-expenses')
const insertTask = require('./insert-task')
const insertClaimEvent = require('./insert-claim-event')
const tasksEnum = require('../../constants/tasks-enum')
const statusEnum = require('../../constants/status-enum')
const claimEventEnum = require('../../constants/claim-event-enum')

module.exports = (reference, eligibilityId, claimId, visitorEmailAddress) => {
  log.info(`Auto approval: Setting claim status to auto approved ${claimId}`)
  return setClaimStatusToAutoApproved(claimId)
    .then(() => {
      log.info(`Auto approval: auto approve claim expenses ${claimId}`)
      return autoApproveClaimExpenses(claimId)
    })
    .then(() => {
      log.info(`Auto approval: Insert accept claim notification task ${claimId}`)
      return insertTask(reference, eligibilityId, claimId, tasksEnum.ACCEPT_CLAIM_NOTIFICATION, visitorEmailAddress)
    })
    .then(() => {
      log.info(`Auto approval: Inserting a claim event ${claimId}`)
      return insertClaimEvent(
        reference,
        eligibilityId,
        claimId,
        null,
        claimEventEnum.CLAIM_AUTO_APPROVED.value,
        null,
        'Passed all auto approval checks',
        true,
      )
    })
}

function setClaimStatusToAutoApproved(claimId) {
  const db = getDatabaseConnector()

  return db('IntSchema.Claim').where('ClaimId', claimId).update({
    Status: statusEnum.AUTOAPPROVED,
    VisitConfirmationCheck: statusEnum.APPROVED,
    DateReviewed: dateFormatter.now().toDate(),
    DateApproved: dateFormatter.now().toDate(),
  })
}
