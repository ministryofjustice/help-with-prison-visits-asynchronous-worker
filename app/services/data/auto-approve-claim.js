const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

const insertTask = require('../data/insert-task')
const tasksEnum = require('../../constants/tasks-enum')
const statusEnum = require('../../constants/status-enum')

module.exports = function (claimAndAutoApprovalData, visitorEmailAddress) {
  return knex('IntSchema.Claim')
    .where('ClaimId', claimAndAutoApprovalData.Claim.ClaimId)
    .update('Status', statusEnum.AUTOAPPROVED)
    .then(function () {
      var updates = []
      claimAndAutoApprovalData.ClaimExpenses.forEach(function (claimExpense) {
        claimExpense.Status = statusEnum.AUTOAPPROVED
        var update = knex('IntSchema.ClaimExpense')
          .where('ClaimId', claimAndAutoApprovalData.Claim.ClaimId)
          .update(claimExpense)
        updates.push(update)
      })

      return Promise.all(updates)
    })
    .then(function () {
      return insertTask(claimAndAutoApprovalData.Claim.Reference, claimAndAutoApprovalData.Claim.EligibilityId, claimAndAutoApprovalData.Claim.ClaimId, tasksEnum.ACCEPT_CLAIM_NOTIFICATION, visitorEmailAddress)
    })
}
