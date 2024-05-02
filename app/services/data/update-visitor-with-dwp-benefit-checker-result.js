const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (visitorId, dwpBenefitCheckerResult, dwpCheckValue) {
  const db = getDatabaseConnector()

  return db('IntSchema.Visitor').where('VisitorId', visitorId).update({
    DWPBenefitCheckerResult: dwpBenefitCheckerResult,
    DWPCheck: dwpCheckValue,
  })
}
