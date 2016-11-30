const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

const autoApproveClaimExpenses = require('./auto-approve-claim-expenses')
const insertTask = require('../data/insert-task')
const tasksEnum = require('../../constants/tasks-enum')
const statusEnum = require('../../constants/status-enum')

module.exports = function (claimAndAutoApprovalData, visitorEmailAddress) {
  return knex('IntSchema.Claim')
    .where('ClaimId', claimAndAutoApprovalData.Claim.ClaimId)
    .update('Status', statusEnum.AUTOAPPROVED)
    .then(function () {
      return autoApproveClaimExpenses(claimAndAutoApprovalData.ClaimExpenses)
    })
    .then(function () {
      return insertTask(claimAndAutoApprovalData.Claim.Reference, claimAndAutoApprovalData.Claim.EligibilityId, claimAndAutoApprovalData.Claim.ClaimId, tasksEnum.ACCEPT_CLAIM_NOTIFICATION, visitorEmailAddress)
    })
}
