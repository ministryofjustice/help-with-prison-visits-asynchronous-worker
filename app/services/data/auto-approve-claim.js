const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

const autoApproveClaimExpenses = require('./auto-approve-claim-expenses')
const insertTask = require('../data/insert-task')
const tasksEnum = require('../../constants/tasks-enum')
const statusEnum = require('../../constants/status-enum')

module.exports = function (claimId, visitorEmailAddress) {
  var claim

  return getClaim(claimId)
    .then(function (result) {
      claim = result
      return setClaimStatusToAutoApproved(claim)
    })
    .then(function () {
      return autoApproveClaimExpenses(claimId)
    })
    .then(function () {
      return insertTask(claim.Reference, claim.EligibilityId, claim.ClaimId, tasksEnum.ACCEPT_CLAIM_NOTIFICATION, visitorEmailAddress)
    })
}

function getClaim (claimId) {
  return knex('IntSchema.Claim')
    .first()
    .where('ClaimId', claimId)
}

function setClaimStatusToAutoApproved (claim) {
  return knex('IntSchema.Claim')
    .where('ClaimId', claim.ClaimId)
    .update('Status', statusEnum.AUTOAPPROVED)
}
