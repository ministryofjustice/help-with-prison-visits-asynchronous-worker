const moment = require('moment')
const dateFormatter = require('../../../../../app/services/date-formatter')

const hasClaimedLessThanMaxTimesThisYear = require('../../../../../app/services/auto-approval/checks/has-claimed-less-than-max-times-this-year')
const initialClaimId = 800000000

const now = dateFormatter.now()

describe('services/auto-approval/checks/has-claimed-less-than-max-times-this-year', function () {
  it('should return true if the number of claims made for the current year is equal to 26', function () {
    // 25 past plus 1 current
    const autoApprovalData = generateAutoApprovalDataWithPreviousClaims(25, now.clone().subtract(1, 'years'))

    const checkResult = hasClaimedLessThanMaxTimesThisYear(autoApprovalData)
    expect(checkResult.result).toBe(true)
  })

  it('should return false if the number of claims made for the current year is greater than 26', function () {
    const autoApprovalData = generateAutoApprovalDataWithPreviousClaims(27, now.clone().subtract(1, 'years'))
    const checkResult = hasClaimedLessThanMaxTimesThisYear(autoApprovalData)

    expect(checkResult.result).toBe(false)
    expect(checkResult.failureMessage).toBe(
      'This claimant has claimed more than the maximum number of times this year. Claim ref: ABC123, Maximum no of claims per year: 26, No. of claims this year: 27'
    )
  })

  it('should return true if the number of claims made for the current year is less than 26', function () {
    const autoApprovalData = generateAutoApprovalDataWithPreviousClaims(25, now.clone().subtract(1, 'years'))

    const checkResult = hasClaimedLessThanMaxTimesThisYear(autoApprovalData)
    expect(checkResult.result).toBe(true)
  })

  it('should return true if the number of claims made for the current year is zero', function () {
    const autoApprovalData = {
      previousClaims: []
    }
    const checkResult = hasClaimedLessThanMaxTimesThisYear(autoApprovalData)
    expect(checkResult.result).toBe(true)
  })

  it('should return true if the claimant has claimed the max number of claims this year, and submits an advance claim that falls outside the claimable year', function () {
    const autoApprovalData = generateAutoApprovalDataWithPreviousClaims(26, now.clone().subtract(1, 'years'))
    autoApprovalData.Claim.DateOfJourney = now.clone().add('20', 'days').toDate()

    const checkResult = hasClaimedLessThanMaxTimesThisYear(autoApprovalData)
    expect(checkResult.result).toBe(true)
  })
})

function generateAutoApprovalDataWithPreviousClaims (numberOfClaims, startDate) {
  const result = {
    Claim: {
      Reference: 'ABC123',
      DateOfJourney: now.clone().subtract('14', 'days').toDate()
    },
    previousClaims: [],
    maxNumberOfClaimsPerYear: '26'
  }
  const durationSinceStartDate = now.clone().diff(moment(startDate), 'days')
  const daysBetweenClaims = Math.floor(durationSinceStartDate / numberOfClaims)

  for (let i = 0; i < numberOfClaims; i++) {
    const increment = daysBetweenClaims * i

    const dateOfJourney = startDate.add(increment, 'days').toDate()
    const claim = {
      ClaimId: initialClaimId + i,
      DateOfJourney: dateOfJourney
    }

    result.previousClaims.push(claim)
  }

  return result
}
