const config = require('../../../config')
const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = () => {
  const db = getDatabaseConnector()

  return db('IntSchema.AutoApprovalConfig')
    .where('IsEnabled', true)
    .orderBy('DateCreated', 'desc')
    .first()
    .then(autoApprovalConfig => {
      if (autoApprovalConfig) {
        const rulesDisabled = autoApprovalConfig.RulesDisabled
        if (rulesDisabled) {
          autoApprovalConfig.RulesDisabled = rulesDisabled.split(',')
        }
        // HWPV-166: Config not actually editable in database by user so just drop in here
        autoApprovalConfig.CostPerMileEngWal = getDefaults().CostPerMileEngWal
        return autoApprovalConfig
      }
      return getDefaults()
    })
}

function getDefaults() {
  return {
    AutoApprovalEnabled: config.AUTO_APPROVAL_ENABLED === 'true',
    CostVariancePercentage: parseFloat(config.AUTO_APPROVAL_COST_VARIANCE),
    MaxClaimTotal: parseFloat(config.AUTO_APPROVAL_MAX_CLAIM_TOTAL),
    MaxDaysAfterAPVUVisit: parseInt(config.AUTO_APPROVAL_MAX_DAYS_AFTER_APVU_VISIT, 10),
    MaxNumberOfClaimsPerYear: parseInt(config.AUTO_APPROVAL_MAX_CLAIMS_PER_YEAR, 10),
    MaxNumberOfClaimsPerMonth: parseInt(config.AUTO_APPROVAL_MAX_CLAIMS_PER_MONTH, 10),
    RulesDisabled: null,
    CostPerMile: parseFloat(config.AUTO_APPROVAL_COST_PER_MILE),
    CostPerMileEngWal: parseFloat(config.AUTO_APPROVAL_COST_PER_MILE_ENGWAL),
    NumberOfConsecutiveAutoApprovals: parseFloat(config.AUTO_APPROVAL_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS),
  }
}
