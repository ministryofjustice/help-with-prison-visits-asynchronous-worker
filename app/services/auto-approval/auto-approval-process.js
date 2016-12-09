const getDataForAutoApprovalChecks = require('../data/get-data-for-auto-approval-check')
const getAutoApprovalConfig = require('../data/get-auto-approval-config')
const insertClaimEventData = require('../data/insert-claim-event-data')
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
            var result = {checks: []}

            var disabledRules = config.RulesDisabled || []

            // Fail auto-approval check if First time claim, advance claim or status is PENDING
            var visitConfirmationAndReceiptsRequiredCheckEnabled = disabledRules.indexOf('has-uploaded-prison-visit-confirmation-and-receipts') === -1
            var advanceClaimCheckEnabled = disabledRules.indexOf('is-visit-in-past') === -1
            if (autoApprovalData.Claim.ClaimType === claimTypeEnum.FIRST_TIME ||
              (autoApprovalData.Claim.IsAdvanceClaim &&
                advanceClaimCheckEnabled) ||
              (autoApprovalData.Claim.Status === statusEnum.PENDING &&
                visitConfirmationAndReceiptsRequiredCheckEnabled)) {
              console.dir('fail auto approval check!')
              console.log(autoApprovalData.Claim.ClaimType === claimTypeEnum.FIRST_TIME)
              console.log(autoApprovalData.Claim.IsAdvanceClaim)
              console.log(autoApprovalData.Claim.Status === statusEnum.PENDING)
              console.log('advanceClaimCheckDisabled:' + advanceClaimCheckEnabled)
              result.claimApproved = false
              return result
            }

            // Add AutoApprovalConfig
            autoApprovalData.costVariancePercentage = config.CostVariancePercentage || '10'
            autoApprovalData.maxNumberOfClaimsPerYear = config.MaxNumberOfClaimsPerYear || '26'
            autoApprovalData.maxDaysAfterAPVUVisit = config.MaxDaysAfterAPVUVisit || '28'
            autoApprovalData.maxClaimTotal = config.MaxClaimTotal || '250'

            autoApprovalRulesEnum.forEach(function (check) {
              if (disabledRules.indexOf(check) === -1) {
                var checkResult = autoApprovalChecks[check](autoApprovalData)
                result.checks.push(checkResult)
              }
            })

            result.claimApproved = true
            // Loop through result properties, if any are false, then the claim should not be approved
            result.checks.forEach(function (check) {
              if (!check.result) {
                result.claimApproved = false
              }
            })

            if (result.claimApproved) {
              return autoApproveClaim(claimId, autoApprovalData.Visitor.EmailAddress)
                .then(function () {
                  return result
                })
            } else {
              return insertClaimEventData(autoApprovalData.Claim, 'AUTO-APPROVAL-FAILURE', autoApprovalData.Visitor.EmailAddress, generateFailureReasonString(result.checks), true)
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
