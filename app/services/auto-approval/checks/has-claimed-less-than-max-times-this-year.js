const moment = require('moment')
const dateFormatter = require('../../date-formatter')

const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'has-claimed-less-than-max-times-this-year'
const FAILURE_MESSAGE = 'This claimant has claimed more than the maximum number of times this year'

module.exports = function (autoApprovalData) {
  if (!autoApprovalData.previousClaims || autoApprovalData.previousClaims.length < 1) {
    return new AutoApprovalCheckResult(CHECK_NAME, true, '')
  }

  var firstClaimDate = moment(getFirstClaimDate(autoApprovalData.previousClaims))
  var now = dateFormatter.now().startOf('day')

  var daysSinceFirstClaim = now.diff(firstClaimDate, 'days')
  var durationSinceFirstClaim = moment.duration(daysSinceFirstClaim, 'days')
  var monthsSinceStartOfClaimableYear = durationSinceFirstClaim.get('months')
  var daysSinceStartOfClaimableYear = durationSinceFirstClaim.get('days')

  var startOfClaimableYear = now.subtract(monthsSinceStartOfClaimableYear, 'months')
    .subtract(daysSinceStartOfClaimableYear, 'days')
  var endOfClaimableYear = startOfClaimableYear.clone().add('1', 'years')

  var numberOfClaimsThisYear = getNumberOfClaimsSinceDate(autoApprovalData.previousClaims, autoApprovalData.Claim, startOfClaimableYear.toDate(), endOfClaimableYear.toDate())
  var checkPassed = numberOfClaimsThisYear <= autoApprovalData.maxNumberOfClaimsPerYear

  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE)
}

function getNumberOfClaimsSinceDate (previousClaims, currentClaim, date, cutOffDate) {
  var count = 0

  if (currentClaim.DateOfJourney >= date && currentClaim.DateOfJourney <= cutOffDate) {
    count++
  }

  for (var i = 0; i < previousClaims.length; i++) {
    var claim = previousClaims[i]

    if (claim.DateOfJourney >= date) {
      count++
    }
  }

  return count
}

function getFirstClaimDate (previousClaims) {
  return previousClaims.sort(compareDates)[0].DateOfJourney
}

function compareDates (a, b) {
  if (a.DateOfJourney < b.DateOfJourney) {
    return -1
  }
  if (a.DateOfJourney > b.DateOfJourney) {
    return 1
  }
  return 0
}
