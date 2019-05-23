const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (autoApprovalId) {
  return knex('IntSchema.AutoApproval').where('AutoApprovalId', autoApprovalId).del()
}
