const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = (schema, reference, eligibilityId) => {
  const db = getDatabaseConnector()

  return db(`${schema}.Visitor`)
    .where({ Reference: reference, EligibilityId: eligibilityId })
    .first('EmailAddress')
    .then(result => {
      return result.EmailAddress
    })
}
