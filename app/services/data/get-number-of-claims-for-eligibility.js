const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = (schema, eligibilityId) => {
  const db = getDatabaseConnector()

  return db(`${schema}.Claim`)
    .count('EligibilityId as count')
    .where('EligibilityId', eligibilityId)
    .then(countResult => {
      return countResult[0].count
    })
}
