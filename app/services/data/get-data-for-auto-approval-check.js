const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const getAllClaimData = require('./get-all-claim-data')
const statusEnum = require('../../constants/status-enum')

module.exports = function (reference, eligibilityId, claimId) {
  var claimData

  return getAllClaimData('IntSchema', reference, eligibilityId, claimId)
  .then(function (data) { claimData = data })
  .then(function () { return getPreviousClaims(claimId, eligibilityId) })
  .then(function (previousClaims) { claimData.previousClaims = previousClaims })
  .then(function () { return getLatestManuallyApprovedClaim(claimData.previousClaims) })
  .then(function (latestManuallyApprovedClaim) { claimData.latestManuallyApprovedClaim = latestManuallyApprovedClaim })
  .then(function () { return claimData })
}

function getPreviousClaims (claimId, eligibilityId) {
  return knex('IntSchema.Claim')
    .where('EligibilityId', eligibilityId)
    .whereNot('ClaimId', claimId)
    .orderBy('DateReviewed', 'desc')
}

function getLatestManuallyApprovedClaim (previousClaims) {
  if (previousClaims.length > 0) {
    var result = {}
    var latestManuallyApprovedClaim = null

    previousClaims.forEach(function (previousClaim) {
      var previousClaimIsApproved = previousClaim.DateReviewed &&
        previousClaim.Status === statusEnum.APPROVED &&
        !previousClaim.IsAdvanceClaim

      if (previousClaimIsApproved) {
        if (!latestManuallyApprovedClaim) {
          latestManuallyApprovedClaim = previousClaim
        } else {
          if (previousClaim.DateReviewed > latestManuallyApprovedClaim.DateReviewed) {
            latestManuallyApprovedClaim = previousClaim
          }
        }
      }
    })

    result = latestManuallyApprovedClaim

    if (latestManuallyApprovedClaim) {
      return getClaimExpenses(latestManuallyApprovedClaim.ClaimId)
        .then(function (latestManuallyApprovedClaimExpenses) {
          result.claimExpenses = latestManuallyApprovedClaimExpenses
          return result
        })
    } else {
      return Promise.resolve(null)
    }
  } else {
    return Promise.resolve(null)
  }
}

function getClaimExpenses (claimId) {
  return knex('IntSchema.ClaimExpense')
    .where('ClaimId', claimId)
}
