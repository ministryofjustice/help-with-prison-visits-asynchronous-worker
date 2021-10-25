const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (schema, eligibilityId) {
  const db = getDatabaseConnector()

  return db(`${schema}.Claim`)
    .count('EligibilityId as count')
    .where('EligibilityId', eligibilityId)
    .then(function (countResult) {
      return countResult[0].count
    })
}
