const config = require('../../../config')
const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function () {
  const db = getDatabaseConnector()

  return db('IntSchema.AutoApprovalConfig')
    .where('IsEnabled', true)
    .orderBy('DateCreated', 'desc')
    .first()
    .then(function (autoApprovalConfig) {
      if (autoApprovalConfig) {
        const rulesDisabled = autoApprovalConfig.RulesDisabled
        if (rulesDisabled) {
          autoApprovalConfig.RulesDisabled = rulesDisabled.split(',')
        }
        return autoApprovalConfig
      } else {
        return getDefaults()
      }
    })
}

function getDefaults () {
  return {
    AutoApprovalEnabled: config.AUTO_APPROVAL_ENABLED === 'true',
    CostVariancePercentage: parseFloat(config.AUTO_APPROVAL_COST_VARIANCE),
    MaxClaimTotal: parseFloat(config.AUTO_APPROVAL_MAX_CLAIM_TOTAL),
    MaxDaysAfterAPVUVisit: parseInt(config.AUTO_APPROVAL_MAX_DAYS_AFTER_APVU_VISIT),
    MaxNumberOfClaimsPerYear: parseInt(config.AUTO_APPROVAL_MAX_CLAIMS_PER_YEAR),
    MaxNumberOfClaimsPerMonth: parseInt(config.AUTO_APPROVAL_MAX_CLAIMS_PER_MONTH),
    RulesDisabled: null,
    CostPerMile: parseFloat(config.AUTO_APPROVAL_COST_PER_MILE),
    NumberOfConsecutiveAutoApprovals: parseFloat(config.AUTO_APPROVAL_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS)
  }
}
