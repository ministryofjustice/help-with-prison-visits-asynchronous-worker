const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = (startDateSubmitted, endDateSubmitted) => {
  const db = getDatabaseConnector()

  return db('IntSchema.Claim')
    .count('ClaimId as count')
    .whereBetween('DateSubmitted', [startDateSubmitted, endDateSubmitted])
    .then(countResult => {
      return countResult[0].count
    })
}
