const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const getAllClaimData = require('./get-all-claim-data')
const statusEnum = require('../../constants/status-enum')
const moment = require('moment')
const dateFormatter = require('../date-formatter')

module.exports = function (reference, eligibilityId, claimId) {
  var claimData

  return getAllClaimData('IntSchema', reference, eligibilityId, claimId)
  .then(function (data) { claimData = data })
  .then(function () { return getPreviousClaims(claimId, eligibilityId) })
  .then(function (previousClaims) { claimData.previousClaims = previousClaims })
  .then(function () { return getLatestManuallyApprovedClaim(claimData.previousClaims) })
  .then(function (latestManuallyApprovedClaim) {
    claimData.latestManuallyApprovedClaim = latestManuallyApprovedClaim
    claimData.latestManualClaim = getLatestManualClaim(claimData.previousClaims)
  })
  .then(function () {
    var visitDateMoment = moment(claimData.Claim.DateOfJourney)
    var month = visitDateMoment.format('M')
    var day = visitDateMoment.format('D')
    var year = visitDateMoment.format('YYYY')
    return getEligibilityIds(day, month, year)
  })
  .then(function (eligibilityIds) {
    return getPrisonNumberFromEligibilityId(eligibilityIds)
  })
  .then(function (prisonNumbers) {
    claimData.prisonNumbers = prisonNumbers
    return claimData
  })
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

function getLatestManualClaim (previousClaims) {
  var result = {}
  if (previousClaims.length > 0) {
    var latestManualClaim = null

    previousClaims.forEach(function (previousClaim) {
      var previousClaimIsApprovedOrRejected = previousClaim.DateReviewed &&
        (previousClaim.Status === statusEnum.APPROVED || previousClaim.Status === 'REJECTED') &&
        !previousClaim.IsAdvanceClaim

      if (previousClaimIsApprovedOrRejected) {
        if (!latestManualClaim) {
          latestManualClaim = previousClaim
        } else {
          if (previousClaim.DateReviewed > latestManualClaim.DateReviewed) {
            latestManualClaim = previousClaim
          }
        }
      }
    })

    result = latestManualClaim
  }
  return result
}

function getClaimExpenses (claimId) {
  return knex('IntSchema.ClaimExpense')
    .where('ClaimId', claimId)
}

function getEligibilityIds (day, month, year) {
  var dateOfJourney = dateFormatter.buildFormatted(day, month, year)

  return knex.raw(`SELECT * FROM [IntSchema].[getIdsForVisitorPrisonerCheck] (?)`, [ dateOfJourney ])
    .then(function (results) {
      var eligibilityIds = []

      results.forEach(function (result) {
        eligibilityIds.push(result.EligibilityId)
      })

      return eligibilityIds
    })
}

function getPrisonNumberFromEligibilityId (eligibilityIds) {
  return knex('IntSchema.Prisoner').whereIn('EligibilityId', eligibilityIds).select('PrisonNumber')
    .then(function (results) {
      var prisonNumbers = []

      results.forEach(function (result) {
        prisonNumbers.push(result.PrisonNumber)
      })

      return prisonNumbers
    })
}
