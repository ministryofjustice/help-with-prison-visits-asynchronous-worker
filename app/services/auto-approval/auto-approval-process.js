const getDataForAutoApprovalChecks = require('../data/get-data-for-auto-approval-check')
const getAutoApprovalConfig = require('../data/get-auto-approval-config')
const insertClaimEvent = require('../data/insert-claim-event')
const generateFailureReasonString = require('../notify/helpers/generate-failure-reason-string')
const autoApproveClaim = require('../data/auto-approve-claim')
const claimTypeEnum = require('../../constants/claim-type-enum')
const statusEnum = require('../../constants/status-enum')
const autoApprovalRulesEnum = require('../../constants/auto-approval-rules-enum')
const getLastSetNumberOfClaimsStatus = require('../data/get-last-set-number-of-claims-status')

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

            return exceedConsecutiveAutoApprovalLimit(reference, claimId, config.NumberOfConsecutiveAutoApprovals)
              .then(function (exceedAutoApprovalLimit) {
                if (exceedAutoApprovalLimit) {
                  result.claimApproved = false
                  return insertClaimEvent(reference, eligibilityId, claimId, null, 'FORCED-MANUAL-CHECK', autoApprovalData.Visitor.EmailAddress, 'Number of consecutive auto approvals exceeded limit', true)
                    .then(function () {
                      return result
                    })
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

function exceedConsecutiveAutoApprovalLimit (reference, claimId, numberOfConsecutiveAutoApprovals) {
  return getLastSetNumberOfClaimsStatus(reference, claimId, numberOfConsecutiveAutoApprovals)
    .then(function (claims) {
      var numberOfAutoApprovals = 0
      claims.forEach(function (claim) {
        console.log(claim.Status)
        if (claim.Status === statusEnum.AUTOAPPROVED) {
          numberOfAutoApprovals++
        }
      })
      console.log(numberOfConsecutiveAutoApprovals <= numberOfAutoApprovals)
      return numberOfConsecutiveAutoApprovals <= numberOfAutoApprovals
    })
}

function addAutoApprovalConfigToData (autoApprovalData, config) {
  autoApprovalData.costVariancePercentage = config.CostVariancePercentage
  autoApprovalData.maxNumberOfClaimsPerYear = config.MaxNumberOfClaimsPerYear
  autoApprovalData.maxDaysAfterAPVUVisit = config.MaxDaysAfterAPVUVisit
  autoApprovalData.maxClaimTotal = config.MaxClaimTotal
  autoApprovalData.maxNumberOfClaimsPerMonth = config.MaxNumberOfClaimsPerMonth
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
