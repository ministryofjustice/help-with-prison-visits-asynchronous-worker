const expect = require('chai').expect
const moment = require('moment')

const hasClaimedLessThanMaxTimesThisYear = require('../../../../../app/services/auto-approval/checks/has-claimed-less-than-max-times-this-year')
var initialClaimId = 800000000

describe('services/auto-approval/checks/has-claimed-less-than-max-times-this-year', function () {
  it('should return false if the number of claims made for the current year is greater than 26', function () {
    var now = moment()
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(60, now.subtract(2, 'years'))

    var checkResult = hasClaimedLessThanMaxTimesThisYear(autoApprovalData)
    expect(checkResult.result).to.equal(false)
  })

  it('should return true if the number of claims made for the current year is less than 26', function () {
    var now = moment()
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(45, now.subtract(2, 'years'))

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
})

function generateAutoApprovalDataWithPreviousClaims (numberOfClaims, startDate) {
  var result = {
    previousClaims: []
  }
  var now = moment()
  var durationSinceStartDate = now.diff(startDate, 'days')
  var daysBetweenClaims = Math.floor(durationSinceStartDate / numberOfClaims)

  for (var i = 0; i < numberOfClaims; i++) {
    var claim = {
      ClaimId: initialClaimId + i,
      DateOfJourney: startDate.add((daysBetweenClaims), 'days').toDate()
    }

    result.previousClaims.push(claim)
  }

  return result
}
