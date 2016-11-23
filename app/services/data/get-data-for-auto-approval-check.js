const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

const statusEnum = require('../../constants/status-enum')

module.exports = function (claim) {
  var result = {}

  return getPreviousClaims(claim.ClaimId, claim.EligibilityId, claim.DateOfJourney)
    .then(function (previousClaims) {
      result.previousClaims = previousClaims
      var latestManuallyApprovedClaim = getLatestManuallyApprovedClaim(previousClaims)

      if (latestManuallyApprovedClaim != null) {
        result.latestManuallyApprovedClaim = latestManuallyApprovedClaim

        return getClaimExpenses(result.latestManuallyApprovedClaim.ClaimId)
          .then(function (latestManuallyApprovedClaimExpenses) {
            result.latestManuallyApprovedClaim.claimExpenses = latestManuallyApprovedClaimExpenses
            return result
          })
      } else {
        return result
      }
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
    var latestManuallyApprovedClaim = previousClaims[0]

    previousClaims.forEach(function (previousClaim) {
      if (previousClaim.Status === statusEnum.APPROVED && previousClaim.DateSubmitted < latestManuallyApprovedClaim.DateSubmitted) {
        latestManuallyApprovedClaim = previousClaim
      }
    })

    return latestManuallyApprovedClaim
  } else {
    return null
  }
}

function getClaimExpenses (claimId) {
  return knex('IntSchema.ClaimExpense')
    .where('ClaimId', claimId)
}
