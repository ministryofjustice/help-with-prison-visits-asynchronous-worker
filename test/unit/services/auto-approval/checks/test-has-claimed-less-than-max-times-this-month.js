const expect = require('chai').expect
const moment = require('moment')

const hasClaimedLessThanMaxTimesThisMonth = require('../../../../../app/services/auto-approval/checks/has-claimed-less-than-max-times-this-month')
const claimStatusEnum = require('../../../../../app/constants/claim-status-enum')
var initialClaimId = 800000000
const MAX_NUMBER_OF_CLAIMS_PER_MONTH = '4'

describe('services/auto-approval/checks/has-claimed-less-than-max-times-this-month', function () {
  it(`should return false if the number of claims made for the current month is greater than ${MAX_NUMBER_OF_CLAIMS_PER_MONTH}`, function () {
    var firstOfCurrentMonth = moment().startOf('month')
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(8, firstOfCurrentMonth)
    autoApprovalData.previousClaims = setClaimStatuses(autoApprovalData.previousClaims, 2, 'NEW')

    var checkResult = hasClaimedLessThanMaxTimesThisMonth(autoApprovalData)
    expect(checkResult.result).to.equal(false)
  })

  it(`should return true if the number of claims made for the current month is less than ${MAX_NUMBER_OF_CLAIMS_PER_MONTH}`, function () {
    var firstOfCurrentMonth = moment().startOf('month')
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(6, firstOfCurrentMonth)
    autoApprovalData = setClaimStatuses(autoApprovalData.previousClaims, 2, 'NEW')

    var checkResult = hasClaimedLessThanMaxTimesThisMonth(autoApprovalData)
    expect(checkResult.result).to.equal(true)
  })

  it('should return true if the number of claims made for the current month is zero', function () {
    var autoApprovalData = {
      previousClaims: []
    }
    var checkResult = hasClaimedLessThanMaxTimesThisMonth(autoApprovalData)
    expect(checkResult.result).to.equal(true)
  })
})

function generateAutoApprovalDataWithPreviousClaims (numberOfClaims, startDate) {
  var result = {
    previousClaims: [],
    maxNumberOfClaimsPerMonth: MAX_NUMBER_OF_CLAIMS_PER_MONTH
  }
  var now = moment()
  var durationSinceStartDate = now.diff(startDate, 'days')
  var daysBetweenClaims = Math.floor(durationSinceStartDate / numberOfClaims)

  for (var i = 0; i < numberOfClaims; i++) {
    var claim = {
      ClaimId: initialClaimId + i,
      DateSubmitted: startDate.add((daysBetweenClaims), 'days').toDate(),
      Status: claimStatusEnum.APPROVED
    }

    result.previousClaims.push(claim)
  }

  return result
}

function setClaimStatuses (claims, frequency, status) {
  for (var i = 0; i < claims.length; i++) {
    if (i % frequency === 0) {
      claims[i].Status = status
    }
  }

  return claims
}
