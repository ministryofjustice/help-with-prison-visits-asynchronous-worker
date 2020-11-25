const getDataForAutoApprovalChecks = require('../data/get-data-for-auto-approval-check')
const getAutoApprovalConfig = require('../data/get-auto-approval-config')
const insertClaimEvent = require('../data/insert-claim-event')
const generateFailureReasonString = require('../notify/helpers/generate-failure-reason-string')
const autoApproveClaim = require('../data/auto-approve-claim')
const insertAutoApproveClaim = require('../data/insert-auto-approve-claim')
const claimTypeEnum = require('../../constants/claim-type-enum')
const statusEnum = require('../../constants/status-enum')
const autoApprovalRulesEnum = require('../../constants/auto-approval-rules-enum')
const claimEventEnum = require('../../constants/claim-event-enum')
const getLastSetNumberOfClaimsStatus = require('../data/get-last-set-number-of-claims-status')
const dateFormatter = require('../date-formatter')

const autoApprovalChecks = {}

autoApprovalRulesEnum.forEach(function (check) {
  autoApprovalChecks[check] = require(`./checks/${check}`)
})

module.exports = function (reference, eligibilityId, claimId) {
  return getAutoApprovalConfig()
    .then(function (config) {
      if (config.AutoApprovalEnabled) {
        return getDataForAutoApprovalChecks(reference, eligibilityId, claimId)
          .then(function (autoApprovalData) {
            const result = {
              checks: [],
              claimApproved: true
            }

            const disabledRules = config.RulesDisabled || []

            if (failBasedOnPreRequisiteChecks(result, autoApprovalData)) {
              result.claimApproved = false
              return result
            }

            // This rule is not in enum as it does not have a dedicated check assosiated with it like the other rules that can be disabled
            const forceManualCheck = !disabledRules.includes('force-manual-check-after-number-of-auto-approvals')

            return exceedConsecutiveAutoApprovalLimit(reference, claimId, config.NumberOfConsecutiveAutoApprovals, forceManualCheck)
              .then(function (exceedAutoApprovalLimit) {
                if (exceedAutoApprovalLimit) {
                  result.claimApproved = false
                  return insertClaimEvent(reference, eligibilityId, claimId, null, claimEventEnum.FORCED_MANUAL_CHECK.value, autoApprovalData.Visitor.EmailAddress, 'Number of consecutive auto approvals exceeded limit', true)
                    .then(function () {
                      return result
                    })
                }

                addAutoApprovalConfigToData(autoApprovalData, config)

                runEnabledChecks(result, autoApprovalData, disabledRules)

                if (result.claimApproved) {
                  const now = dateFormatter.now().toDate()

                  if (now.getDay() < 5 && now.getHours() >= 10 && now.getHours() < 17) {
                    return autoApproveClaim(reference, eligibilityId, claimId, autoApprovalData.Visitor.EmailAddress)
                      .then(function () {
                        return result
                      })
                  } else {
                    return insertAutoApproveClaim(reference, eligibilityId, claimId, autoApprovalData.Visitor.EmailAddress)
                      .then(function () {
                        return result
                      })
                  }
                } else {
                  return insertClaimEvent(reference, eligibilityId, claimId, null, claimEventEnum.AUTO_APPROVAL_FAILURE.value, autoApprovalData.Visitor.EmailAddress, generateFailureReasonString(result.checks), true)
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

function exceedConsecutiveAutoApprovalLimit (reference, claimId, numberOfConsecutiveAutoApprovals, forceManualCheck) {
  return getLastSetNumberOfClaimsStatus(reference, claimId, numberOfConsecutiveAutoApprovals)
    .then(function (claims) {
      let numberOfAutoApprovals = 0
      if (forceManualCheck) {
        claims.forEach(function (claim) {
          if (claim.Status === statusEnum.AUTOAPPROVED) {
            numberOfAutoApprovals++
          }
        })
      }
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
      const checkResult = autoApprovalChecks[checkName](autoApprovalData)
      result.checks.push(checkResult)
      if (!checkResult.result) {
        result.claimApproved = false
      }
    }
  })
}
