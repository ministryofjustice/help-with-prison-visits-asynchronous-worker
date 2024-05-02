const moment = require('moment')
const dateFormatter = require('../../date-formatter')

const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'has-claimed-less-than-max-times-this-year'
const FAILURE_MESSAGE = 'This claimant has claimed more than the maximum number of times this year'

module.exports = function (autoApprovalData) {
  if (!autoApprovalData.previousClaims || autoApprovalData.previousClaims.length < 1) {
    return new AutoApprovalCheckResult(CHECK_NAME, true, '')
  }

  const firstClaimDate = moment(getFirstClaimDate(autoApprovalData.previousClaims))
  const now = dateFormatter.now().startOf('day')

  const daysSinceFirstClaim = now.diff(firstClaimDate, 'days')
  const durationSinceFirstClaim = moment.duration(daysSinceFirstClaim, 'days')
  const monthsSinceStartOfClaimableYear = durationSinceFirstClaim.get('months')
  const daysSinceStartOfClaimableYear = durationSinceFirstClaim.get('days')

  const startOfClaimableYear = now
    .subtract(monthsSinceStartOfClaimableYear, 'months')
    .subtract(daysSinceStartOfClaimableYear, 'days')
  const endOfClaimableYear = startOfClaimableYear.clone().add('1', 'years')

  const numberOfClaimsThisYear = getNumberOfClaimsSinceDate(
    autoApprovalData.previousClaims,
    autoApprovalData.Claim,
    startOfClaimableYear.toDate(),
    endOfClaimableYear.toDate(),
  )
  const checkPassed = numberOfClaimsThisYear <= autoApprovalData.maxNumberOfClaimsPerYear
  const ADDITIONAL_INFO = `. Claim ref: ${autoApprovalData.Claim.Reference}, Maximum no of claims per year: ${autoApprovalData.maxNumberOfClaimsPerYear}, No. of claims this year: ${numberOfClaimsThisYear}`
  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE + ADDITIONAL_INFO)
}

function getNumberOfClaimsSinceDate(previousClaims, currentClaim, date, cutOffDate) {
  let count = 0

  if (currentClaim.DateOfJourney >= date && currentClaim.DateOfJourney <= cutOffDate) {
    count += 1
  }

  for (let i = 0; i < previousClaims.length; i += 1) {
    const claim = previousClaims[i]

    if (claim.DateOfJourney >= date) {
      count += 1
    }
  }

  return count
}

function getFirstClaimDate(previousClaims) {
  return previousClaims.sort(compareDates)[0].DateOfJourney
}

function compareDates(a, b) {
  if (a.DateOfJourney < b.DateOfJourney) {
    return -1
  }
  if (a.DateOfJourney > b.DateOfJourney) {
    return 1
  }
  return 0
}
