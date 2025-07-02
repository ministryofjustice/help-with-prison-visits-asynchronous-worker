const moment = require('moment')
const { getDatabaseConnector } = require('../../databaseConnector')
const getAllClaimData = require('./get-all-claim-data')
const statusEnum = require('../../constants/status-enum')
const dateFormatter = require('../date-formatter')

module.exports = (reference, eligibilityId, claimId) => {
  let claimData

  return getAllClaimData('IntSchema', reference, eligibilityId, claimId)
    .then(data => {
      claimData = data
    })
    .then(() => {
      return getPreviousClaims(claimId, eligibilityId)
    })
    .then(previousClaims => {
      claimData.previousClaims = previousClaims
    })
    .then(() => {
      return getLatestManuallyApprovedClaim(claimData.previousClaims)
    })
    .then(latestManuallyApprovedClaim => {
      claimData.latestManuallyApprovedClaim = latestManuallyApprovedClaim
      claimData.latestManualClaim = getLatestManualClaim(claimData.previousClaims)
    })
    .then(() => {
      const visitDateMoment = moment(claimData.Claim.DateOfJourney)
      const month = visitDateMoment.format('M')
      const day = visitDateMoment.format('D')
      const year = visitDateMoment.format('YYYY')
      return getEligibilityIds(day, month, year)
    })
    .then(eligibilityIds => {
      return getPrisonNumberFromEligibilityId(eligibilityIds)
    })
    .then(prisonNumbers => {
      claimData.prisonNumbers = prisonNumbers
      return claimData
    })
}

function getPreviousClaims(claimId, eligibilityId) {
  const db = getDatabaseConnector()

  return db('IntSchema.Claim')
    .where('EligibilityId', eligibilityId)
    .whereNot('ClaimId', claimId)
    .orderBy('DateReviewed', 'desc')
}

function getLatestManuallyApprovedClaim(previousClaims) {
  if (previousClaims.length > 0) {
    let result = {}
    let latestManuallyApprovedClaim = null

    previousClaims.forEach(previousClaim => {
      const previousClaimIsApproved =
        previousClaim.DateReviewed && previousClaim.Status === statusEnum.APPROVED && !previousClaim.IsAdvanceClaim

      if (previousClaimIsApproved) {
        if (!latestManuallyApprovedClaim) {
          latestManuallyApprovedClaim = previousClaim
        } else if (previousClaim.DateReviewed > latestManuallyApprovedClaim.DateReviewed) {
          latestManuallyApprovedClaim = previousClaim
        }
      }
    })

    result = latestManuallyApprovedClaim

    if (latestManuallyApprovedClaim) {
      return getClaimExpenses(latestManuallyApprovedClaim.ClaimId).then(latestManuallyApprovedClaimExpenses => {
        result.claimExpenses = latestManuallyApprovedClaimExpenses
        return result
      })
    }
    return Promise.resolve(null)
  }
  return Promise.resolve(null)
}

function getLatestManualClaim(previousClaims) {
  let result = {}
  if (previousClaims.length > 0) {
    let latestManualClaim = null

    previousClaims.forEach(previousClaim => {
      const previousClaimIsApprovedOrRejected =
        previousClaim.DateReviewed &&
        (previousClaim.Status === statusEnum.APPROVED || previousClaim.Status === 'REJECTED') &&
        !previousClaim.IsAdvanceClaim

      if (previousClaimIsApprovedOrRejected) {
        if (!latestManualClaim) {
          latestManualClaim = previousClaim
        } else if (previousClaim.DateReviewed > latestManualClaim.DateReviewed) {
          latestManualClaim = previousClaim
        }
      }
    })

    result = latestManualClaim
  }
  return result
}

function getClaimExpenses(claimId) {
  const db = getDatabaseConnector()

  return db('IntSchema.ClaimExpense').where('ClaimId', claimId)
}

function getEligibilityIds(day, month, year) {
  const dateOfJourney = dateFormatter.buildFormatted(day, month, year)
  const db = getDatabaseConnector()

  return db.raw('SELECT * FROM [IntSchema].[getIdsForVisitorPrisonerCheck] (?)', [dateOfJourney]).then(results => {
    const eligibilityIds = []

    results.forEach(result => {
      eligibilityIds.push(result.EligibilityId)
    })

    return eligibilityIds
  })
}

function getPrisonNumberFromEligibilityId(eligibilityIds) {
  const db = getDatabaseConnector()

  return db('IntSchema.Prisoner')
    .whereIn('EligibilityId', eligibilityIds)
    .select('PrisonNumber')
    .then(results => {
      const prisonNumbers = []

      results.forEach(result => {
        prisonNumbers.push(result.PrisonNumber)
      })

      return prisonNumbers
    })
}
