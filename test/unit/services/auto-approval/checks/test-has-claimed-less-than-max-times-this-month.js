const expect = require('chai').expect
const dateFormatter = require('../../../../../app/services/date-formatter')

const hasClaimedLessThanMaxTimesThisMonth = require('../../../../../app/services/auto-approval/checks/has-claimed-less-than-max-times-this-month')
const claimStatusEnum = require('../../../../../app/constants/claim-status-enum')
var initialClaimId = 800000000
const MAX_NUMBER_OF_CLAIMS_PER_MONTH = '4'

describe('services/auto-approval/checks/has-claimed-less-than-max-times-this-month', function () {
  it(`should return false if the number of claims made for the current month is greater than ${MAX_NUMBER_OF_CLAIMS_PER_MONTH}`, function () {
    var firstOfCurrentMonth = dateFormatter.now().startOf('month')
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(5, firstOfCurrentMonth)

    var checkResult = hasClaimedLessThanMaxTimesThisMonth(autoApprovalData)
    expect(checkResult.result).to.equal(false)
  })

  it(`should return true if the number of claims made for the current month is equal to ${MAX_NUMBER_OF_CLAIMS_PER_MONTH}`, function () {
    var firstOfCurrentMonth = dateFormatter.now().startOf('month')
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(4, firstOfCurrentMonth)

    var checkResult = hasClaimedLessThanMaxTimesThisMonth(autoApprovalData)
    expect(checkResult.result).to.equal(true)
  })

  it(`should return true if the number of claims made for the current month is less than ${MAX_NUMBER_OF_CLAIMS_PER_MONTH}`, function () {
    var firstOfCurrentMonth = dateFormatter.now().startOf('month')
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(3, firstOfCurrentMonth)

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
    var autoApprovalData = generateAutoApprovalDataWithPreviousClaims(4, firstOfCurrentMonth)
    autoApprovalData.Claim.DateOfJourney = secondOfNextMonth.toDate()

    var checkResult = hasClaimedLessThanMaxTimesThisMonth(autoApprovalData)
    expect(checkResult.result).to.equal(true)
  })
})

function generateAutoApprovalDataWithPreviousClaims (numberOfClaims, startDate) {
  var firstOfCurrentMonth = dateFormatter.now().startOf('month')
  var now = dateFormatter.now()
  var result = {
    Claim: {
      DateOfJourney: firstOfCurrentMonth.clone().toDate()
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
