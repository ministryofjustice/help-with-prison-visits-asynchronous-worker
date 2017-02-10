const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (schema, reference, eligibilityId) {
  return knex(`${schema}.Visitor`)
    .where({'Reference': reference, 'EligibilityId': eligibilityId})
    .first('EmailAddress')
    .then(function (result) {
      return result.EmailAddress
    })
}
