const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (emailAddress, prisonNumber) {
  const db = getDatabaseConnector()

  return db('IntSchema.Visitor')
    .join('IntSchema.Prisoner', 'IntSchema.Visitor.EligibilityId', '=', 'IntSchema.Prisoner.EligibilityId')
    .join('IntSchema.Eligibility', 'IntSchema.Visitor.EligibilityId', '=', 'IntSchema.Eligibility.EligibilityId')
    .where({ 'IntSchema.Visitor.EmailAddress': emailAddress, 'IntSchema.Prisoner.PrisonNumber': prisonNumber })
    .first('IntSchema.Visitor.Reference', 'IntSchema.Visitor.FirstName')
    .orderBy('IntSchema.Eligibility.DateSubmitted', 'desc')
}
