const { getDatabaseConnector } = require('../../../databaseConnector')
const dateFormatter = require('../../date-formatter')

module.exports = (claimId, benefit, eligibilityId, reference) => {
  const db = getDatabaseConnector()

  return db('IntSchema.ClaimDocument')
    .select('IntSchema.ClaimDocument.ClaimDocumentId')
    .then(claimDocumentIds => {
      return db('IntSchema.ClaimDocument').insert({
        ClaimDocumentId: getRandomNumberExcludingList(claimDocumentIds),
        ClaimId: claimId,
        EligibilityId: eligibilityId,
        Reference: reference,
        DocumentType: benefit,
        DocumentStatus: 'upload-later',
        IsEnabled: true,
        DateSubmitted: dateFormatter.now().toDate(),
      })
    })
}

function getRandomNumberExcludingList(list) {
  const existingNumbers = list.map(id => id.ClaimDocumentId)

  let randomNumber = getRandomUnsignedInt()

  while (existingNumbers.includes(randomNumber)) {
    randomNumber = getRandomUnsignedInt()
  }

  return randomNumber
}

function getRandomUnsignedInt() {
  return Math.floor(Math.random() * 4294967295) // Unsigned INT max value
}
