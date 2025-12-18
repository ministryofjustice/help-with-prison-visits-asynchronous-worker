const { getDatabaseConnector } = require('../../../databaseConnector')
const dateFormatter = require('../../date-formatter')

module.exports = (claimId, benefit, eligibilityId, reference) => {
  const db = getDatabaseConnector()

  return db('IntSchema.ClaimDocument').insert({
    ClaimDocumentId: Math.floor(Math.random() * 4294967295), // Unsigned INT max value
    ClaimId: claimId,
    EligibilityId: eligibilityId,
    Reference: reference,
    DocumentType: benefit,
    DocumentStatus: 'upload-later',
    IsEnabled: true,
    DateSubmitted: dateFormatter.now().toDate(),
  })
}
