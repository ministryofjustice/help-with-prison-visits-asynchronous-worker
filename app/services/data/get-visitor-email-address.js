const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (schema, reference, eligibilityId) {
  const db = getDatabaseConnector()

  return db(`${schema}.Visitor`)
    .where({ Reference: reference, EligibilityId: eligibilityId })
    .first('EmailAddress')
    .then(function (result) {
      return result.EmailAddress
    })
}
