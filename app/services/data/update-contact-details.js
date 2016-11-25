const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (contactDetails) {
  return knex('IntSchema.Visitor')
    .where({'EligibilityId': contactDetails.EligibilityId, 'Reference': contactDetails.Reference})
    .update({'EmailAddress': contactDetails.EmailAddress, 'PhoneNumber': contactDetails.PhoneNumber})
}
