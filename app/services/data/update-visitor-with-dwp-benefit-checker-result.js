const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (visitorId, dwpBenefitCheckerResult) {
  return knex('IntSchema.Visitor')
    .where('VisitorId', visitorId)
    .update('DWPBenefitCheckerResult', dwpBenefitCheckerResult)
}
