const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = (contactDetails, trx) => {
  if (trx) {
    return trx('IntSchema.Visitor')
      .where({ EligibilityId: contactDetails.EligibilityId, Reference: contactDetails.Reference })
      .update({ EmailAddress: contactDetails.EmailAddress, PhoneNumber: contactDetails.PhoneNumber })
  }
  const db = getDatabaseConnector()

  return db('IntSchema.Visitor')
    .where({ EligibilityId: contactDetails.EligibilityId, Reference: contactDetails.Reference })
    .update({ EmailAddress: contactDetails.EmailAddress, PhoneNumber: contactDetails.PhoneNumber })
}
