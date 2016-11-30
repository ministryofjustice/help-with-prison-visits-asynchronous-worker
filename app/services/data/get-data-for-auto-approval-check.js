const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

const statusEnum = require('../../constants/status-enum')

module.exports = function (claimData) {
  return getPreviousClaims(claimData.Claim.ClaimId, claimData.Claim.EligibilityId, claimData.Claim.DateOfJourney)
    .then(function (previousClaims) {
      claimData.previousClaims = previousClaims
      return getLatestManuallyApprovedClaim(previousClaims)
        .then(function (latestManuallyApprovedClaim) {
          claimData.latestManuallyApprovedClaim = latestManuallyApprovedClaim

          if (!claimData.Claim.Eligibility || claimData.Claim.Prisoner || claimData.Claim.Visitor) {
            return getDataFromInternal(claimData.Claim.ClaimId, claimData.Claim.EligibilityId, claimData.Claim.Reference)
              .then(function (internalData) {
                claimData.Eligibility = internalData.Eligibility
                claimData.Visitor = internalData.Visitor
                claimData.Prisoner = internalData.Prisoner

                return claimData
              })
          } else {
            return Promise.resolve(claimData)
          }
        })
    })
}

function getDataFromInternal (claimId, eligibilityId, reference) {
  var result = {}
  return knex('IntSchema.Eligibility')
    .first()
    .where({'Reference': reference, 'EligibilityId': eligibilityId})
    .then(function (eligibility) {
      result.Eligibility = eligibility

      return knex('IntSchema.Prisoner')
        .first()
        .where({'Reference': reference, 'EligibilityId': eligibilityId})
        .then(function (prisoner) {
          result.Prisoner = prisoner

          return knex('IntSchema.Visitor')
            .first()
            .where({'Reference': reference, 'EligibilityId': eligibilityId})
            .then(function (visitor) {
              result.Visitor = visitor
              return result
            })
        })
    })
}

function getPreviousClaims (claimId, eligibilityId, dateOfVisit) {
  return knex('IntSchema.Claim')
    .where('EligibilityId', eligibilityId)
    .andWhere('DateOfJourney', '<', dateOfVisit)
    .whereNot('ClaimId', claimId)
    .orderBy('DateOfJourney', 'desc')
}

function getLatestManuallyApprovedClaim (previousClaims) {
  if (previousClaims.length > 0) {
    var result = {}
    var latestManuallyApprovedClaim = previousClaims[0]

    previousClaims.forEach(function (previousClaim) {
      if (previousClaim.Status === statusEnum.APPROVED && previousClaim.DateSubmitted < latestManuallyApprovedClaim.DateSubmitted) {
        latestManuallyApprovedClaim = previousClaim
      }
    })

    result = latestManuallyApprovedClaim

    return getClaimExpenses(latestManuallyApprovedClaim.ClaimId)
      .then(function (latestManuallyApprovedClaimExpenses) {
        result.claimExpenses = latestManuallyApprovedClaimExpenses
        return result
      })
  } else {
    return Promise.resolve(null)
  }
}

function getClaimExpenses (claimId) {
  return knex('IntSchema.ClaimExpense')
    .where('ClaimId', claimId)
}
