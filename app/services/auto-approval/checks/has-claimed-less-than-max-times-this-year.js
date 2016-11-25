const moment = require('moment')

const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'hasClaimedLessThanMaxTimesThisYear'
const FAILURE_MESSAGE = 'This claimant has claimed more than the maximum number of times this year'
const MAX_NUMBER_OF_CLAIMS_PER_YEAR = 26

module.exports = function (autoApprovalData) {
  if (autoApprovalData.previousClaims.length < 1) {
    return new AutoApprovalCheckResult(CHECK_NAME, true, '')
  }

  var firstClaimDate = moment(getFirstClaimDate(autoApprovalData.previousClaims))
  var now = moment()

  var daysSinceFirstClaim = now.diff(firstClaimDate, 'days')
  var durationSinceFirstClaim = moment.duration(daysSinceFirstClaim, 'days')
  var startOfClaimableYear = now.subtract(durationSinceFirstClaim.get('years'), 'years')

  var numberOfClaimsThisYear = getNumberOfClaimsSinceDate(autoApprovalData.previousClaims, startOfClaimableYear.toDate())
  var checkPassed = numberOfClaimsThisYear < MAX_NUMBER_OF_CLAIMS_PER_YEAR

  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? FAILURE_MESSAGE : '')
}

function getNumberOfClaimsSinceDate (previousClaims, date) {
  var count = 0

  for (var i = 0; i < previousClaims.length; i++) {
    var claim = previousClaims[i]

    if (claim.DateOfJourney > date) {
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
