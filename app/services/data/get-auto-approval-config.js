const config = require('../../../config')
const knexConfig = require('../../../knexfile').asyncworker
const knex = require('knex')(knexConfig)

module.exports = function () {
  return knex('IntSchema.AutoApprovalConfig')
    .where('IsEnabled', true)
    .orderBy('DateCreated', 'desc')
    .first()
    .then(function (autoApprovalConfig) {
      if (autoApprovalConfig) {
        var rulesDisabled = autoApprovalConfig.RulesDisabled
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
    RulesDisabled: null
  }
}
