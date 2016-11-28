const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

const insertTask = require('../data/insert-task')
const tasksEnum = require('../../constants/tasks-enum')
const statusEnum = require('../../constants/status-enum')

module.exports = function (claim) {
  return knex('IntSchema.Claim')
    .where('ClaimId', claim.ClaimId)
    .update('Status', statusEnum.AUTOAPPROVED)
    .then(function () {
      return insertTask(claim.Reference, claim.EligibilityId, claim.ClaimId, tasksEnum.ACCEPT_CLAIM_NOTIFICATION)
    })
}
