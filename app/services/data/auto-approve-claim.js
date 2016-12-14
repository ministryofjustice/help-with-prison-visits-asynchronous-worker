const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const moment = require('moment')

const autoApproveClaimExpenses = require('./auto-approve-claim-expenses')
const insertTask = require('../data/insert-task')
const insertClaimEvent = require('../data/insert-claim-event')
const tasksEnum = require('../../constants/tasks-enum')
const statusEnum = require('../../constants/status-enum')

module.exports = function (reference, eligibilityId, claimId, visitorEmailAddress) {
  const CLAIM_EVENT = 'CLAIM-APPROVED'

  return setClaimStatusToAutoApproved(claimId)
    .then(function () { return autoApproveClaimExpenses(claimId) })
    .then(function () { return insertTask(reference, eligibilityId, claimId, tasksEnum.ACCEPT_CLAIM_NOTIFICATION, visitorEmailAddress) })
    .then(function () { return insertClaimEvent(reference, eligibilityId, claimId, null, CLAIM_EVENT, null, null, false) })
}

function setClaimStatusToAutoApproved (claimId) {
  return knex('IntSchema.Claim')
    .where('ClaimId', claimId)
    .update({'Status': statusEnum.AUTOAPPROVED, 'DateReviewed': moment().toDate()})
}
