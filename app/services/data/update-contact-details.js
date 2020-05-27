const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (contactDetails, trx) {
  if (trx) {
    return trx('IntSchema.Visitor')
      .where({ EligibilityId: contactDetails.EligibilityId, Reference: contactDetails.Reference })
      .update({ EmailAddress: contactDetails.EmailAddress, PhoneNumber: contactDetails.PhoneNumber })
  } else {
    return knex('IntSchema.Visitor')
      .where({ EligibilityId: contactDetails.EligibilityId, Reference: contactDetails.Reference })
      .update({ EmailAddress: contactDetails.EmailAddress, PhoneNumber: contactDetails.PhoneNumber })
  }
}
