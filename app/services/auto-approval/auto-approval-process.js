const getDataForAutoApprovalChecks = require('../data/get-data-for-auto-approval-check')
const getAutoApprovalConfig = require('../data/get-auto-approval-config')
const insertClaimEvent = require('../data/insert-claim-event')
const generateFailureReasonString = require('../notify/helpers/generate-failure-reason-string')
const autoApproveClaim = require('../data/auto-approve-claim')
const claimTypeEnum = require('../../constants/claim-type-enum')
const statusEnum = require('../../constants/status-enum')
const autoApprovalRulesEnum = require('../../constants/auto-approval-rules-enum')

var autoApprovalChecks = {}

autoApprovalRulesEnum.forEach(function (check) {
  autoApprovalChecks[check] = require(`./checks/${check}`)
})

module.exports = function (reference, eligibilityId, claimId) {
  return getAutoApprovalConfig()
    .then(function (config) {
      if (config.AutoApprovalEnabled) {
        return getDataForAutoApprovalChecks(reference, eligibilityId, claimId)
          .then(function (autoApprovalData) {
            var result = {
              checks: [],
              claimApproved: true
            }

            var disabledRules = config.RulesDisabled || []

            if (failBasedOnPreRequisiteChecks(result, autoApprovalData)) {
              result.claimApproved = false
              return result
            }

            addAutoApprovalConfigToData(autoApprovalData, config)

            runEnabledChecks(result, autoApprovalData, disabledRules)

            if (result.claimApproved) {
              return autoApproveClaim(reference, eligibilityId, claimId, autoApprovalData.Visitor.EmailAddress)
                .then(function () {
                  return result
                })
            } else {
              return insertClaimEvent(reference, eligibilityId, claimId, null, 'AUTO-APPROVAL-FAILURE', autoApprovalData.Visitor.EmailAddress, generateFailureReasonString(result.checks), true)
                .then(function () {
                  return result
                })
            }
          })
      } else {
        return Promise.resolve(null)
      }
    })
}

function failBasedOnPreRequisiteChecks (result, autoApprovalData) {
  if (autoApprovalData.Claim.ClaimType === claimTypeEnum.FIRST_TIME ||
    autoApprovalData.Claim.ClaimType === claimTypeEnum.REPEAT_NEW_ELIGIBILITY ||
    (autoApprovalData.Claim.Status !== statusEnum.NEW)) {
    return true
  }
}

function addAutoApprovalConfigToData (autoApprovalData, config) {
  autoApprovalData.costVariancePercentage = config.CostVariancePercentage || '10'
  autoApprovalData.maxNumberOfClaimsPerYear = config.MaxNumberOfClaimsPerYear || '26'
  autoApprovalData.maxDaysAfterAPVUVisit = config.MaxDaysAfterAPVUVisit || '28'
  autoApprovalData.maxClaimTotal = config.MaxClaimTotal || '250'
  autoApprovalData.maxNumberOfClaimsPerMonth = config.MaxNumberOfClaimsPerMonth || '4'
}

function runEnabledChecks (result, autoApprovalData, disabledRules) {
  autoApprovalRulesEnum.forEach(function (checkName) {
    if (disabledRules.indexOf(checkName) === -1) {
      var checkResult = autoApprovalChecks[checkName](autoApprovalData)
      result.checks.push(checkResult)
      if (!checkResult.result) {
        result.claimApproved = false
      }
    }
  })
}
