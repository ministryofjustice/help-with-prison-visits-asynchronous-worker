const expect = require('chai').expect
const moment = require('moment')
const dateFormatter = require('../../../../../app/services/date-formatter')

const hasClaimedLessThanMaxTimesThisYear = require('../../../../../app/services/auto-approval/checks/has-claimed-less-than-max-times-this-year')
var initialClaimId = 800000000

const now = dateFormatter.now()

describe('services/auto-approval/checks/has-claimed-less-than-max-times-this-year', function () {
  it('should return false if the number of claims made for the current year is equal to 26', function () {
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(26, now.clone().subtract(1, 'years'))

    var checkResult = hasClaimedLessThanMaxTimesThisYear(autoApprovalData)
    expect(checkResult.result).to.equal(false)
  })

  it('should return false if the number of claims made for the current year is greater than 26', function () {
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(27, now.clone().subtract(1, 'years'))

    var checkResult = hasClaimedLessThanMaxTimesThisYear(autoApprovalData)
    expect(checkResult.result).to.equal(false)
  })

  it('should return true if the number of claims made for the current year is less than 26', function () {
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(25, now.clone().subtract(1, 'years'))

    var checkResult = hasClaimedLessThanMaxTimesThisYear(autoApprovalData)
    expect(checkResult.result).to.equal(true)
  })

  it('should return true if the number of claims made for the current year is zero', function () {
    var autoApprovalData = {
      previousClaims: []
    }
    var checkResult = hasClaimedLessThanMaxTimesThisYear(autoApprovalData)
    expect(checkResult.result).to.equal(true)
  })

  it('should return true if the claimant has claimed the max number of claims this year, and submits an advance claim that falls outside the claimable year', function () {
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(26, now.clone().subtract(1, 'years'))
    autoApprovalData.Claim.DateOfJourney = now.clone().add('20', 'days').toDate()

    var checkResult = hasClaimedLessThanMaxTimesThisYear(autoApprovalData)
    expect(checkResult.result).to.equal(true)
  })
})

function generateAutoApprovalDataWithPreviousClaims (numberOfClaims, startDate) {
  var result = {
    Claim: {
      DateOfJourney: now.clone().subtract('14', 'days').toDate()
    },
    previousClaims: [],
    maxNumberOfClaimsPerYear: '26'
  }
  var durationSinceStartDate = now.clone().diff(moment(startDate), 'days')
  var daysBetweenClaims = Math.floor(durationSinceStartDate / numberOfClaims)

  for (var i = 0; i < numberOfClaims - 1; i++) {
    var increment = daysBetweenClaims * i

    var dateOfJourney = startDate.add(increment, 'days').toDate()
    var claim = {
      ClaimId: initialClaimId + i,
      DateOfJourney: dateOfJourney
    }

    result.previousClaims.push(claim)
  }

  return result
}
