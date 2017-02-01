const expect = require('chai').expect
const dateFormatter = require('../../../../../app/services/date-formatter')

const hasClaimedLessThanMaxTimesThisMonth = require('../../../../../app/services/auto-approval/checks/has-claimed-less-than-max-times-this-month')
const claimStatusEnum = require('../../../../../app/constants/claim-status-enum')
var initialClaimId = 800000000
const MAX_NUMBER_OF_CLAIMS_PER_MONTH = '4'

describe('services/auto-approval/checks/has-claimed-less-than-max-times-this-month', function () {
  it(`should return false if the number of claims made for the current month is greater than ${MAX_NUMBER_OF_CLAIMS_PER_MONTH}`, function () {
    var firstOfCurrentMonth = dateFormatter.now().startOf('month')
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(10, firstOfCurrentMonth)
    // Should be 5 APPROVED past claims
    autoApprovalData.previousClaims = setClaimStatuses(autoApprovalData.previousClaims, 2, 'NEW')

    var checkResult = hasClaimedLessThanMaxTimesThisMonth(autoApprovalData)
    expect(checkResult.result).to.equal(false)
  })

  it(`should return false if the number of claims made for the current month is equal to ${MAX_NUMBER_OF_CLAIMS_PER_MONTH}`, function () {
    var firstOfCurrentMonth = dateFormatter.now().startOf('month')
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(9, firstOfCurrentMonth)
    // Should be 4 APPROVED past claims
    autoApprovalData.previousClaims = setClaimStatuses(autoApprovalData.previousClaims, 2, 'NEW')
    console.dir(autoApprovalData)

    var checkResult = hasClaimedLessThanMaxTimesThisMonth(autoApprovalData)
    expect(checkResult.result).to.equal(false)
  })

  it(`should return true if the number of claims made for the current month is less than ${MAX_NUMBER_OF_CLAIMS_PER_MONTH}`, function () {
    var firstOfCurrentMonth = dateFormatter.now().startOf('month')
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(8, firstOfCurrentMonth)
    // Should be 3 APPROVED past claims
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

  it('should return true if the claimant has claimed the max number of claims this month, and submits an advance claim that falls outside the claimable month', function () {
    var firstOfCurrentMonth = dateFormatter.now().startOf('month')
    var secondOfNextMonth = dateFormatter.now().startOf('month').add('1', 'months').add('1', 'days')
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(MAX_NUMBER_OF_CLAIMS_PER_MONTH, firstOfCurrentMonth)
    autoApprovalData.Claim.DateOfJourney = secondOfNextMonth.toDate()

    var checkResult = hasClaimedLessThanMaxTimesThisMonth(autoApprovalData)
    expect(checkResult.result).to.equal(true)
  })
})

function generateAutoApprovalDataWithPreviousClaims (numberOfClaims, startDate) {
  var now = dateFormatter.now()
  var result = {
    Claim: {
      DateOfJourney: now.clone().subtract('14', 'days').toDate()
    },
    previousClaims: [],
    maxNumberOfClaimsPerMonth: MAX_NUMBER_OF_CLAIMS_PER_MONTH
  }

  var durationSinceStartDate = now.diff(startDate, 'days')
  var daysBetweenClaims = Math.floor(durationSinceStartDate / numberOfClaims)

  for (var i = 0; i < numberOfClaims - 1; i++) {
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
