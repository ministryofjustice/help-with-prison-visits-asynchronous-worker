const dateFormatter = require('../../../../../app/services/date-formatter')

const hasClaimedLessThanMaxTimesThisMonth = require('../../../../../app/services/auto-approval/checks/has-claimed-less-than-max-times-this-month')
const claimStatusEnum = require('../../../../../app/constants/claim-status-enum')
const initialClaimId = 800000000
const MAX_NUMBER_OF_CLAIMS_PER_MONTH = '4'

describe('services/auto-approval/checks/has-claimed-less-than-max-times-this-month', function () {
  it(`should return false if the number of claims made for the current month is greater than ${MAX_NUMBER_OF_CLAIMS_PER_MONTH}`, function () {
    const firstOfCurrentMonth = dateFormatter.now().startOf('month')
    const autoApprovalData = generateAutoApprovalDataWithPreviousClaims(5, firstOfCurrentMonth)

    const checkResult = hasClaimedLessThanMaxTimesThisMonth(autoApprovalData)
    expect(checkResult.result).toBe(false)
    expect(checkResult.failureMessage).toBe(
      'This claimant has claimed more than the maximum number of times this month. Claim ref: ABC123, Maximum no of claims per month: 4, No. of claims this month: 5'
    )
  })

  it(`should return true if the number of claims made for the current month is equal to ${MAX_NUMBER_OF_CLAIMS_PER_MONTH}`, function () {
    const firstOfCurrentMonth = dateFormatter.now().startOf('month')
    const autoApprovalData = generateAutoApprovalDataWithPreviousClaims(4, firstOfCurrentMonth)

    const checkResult = hasClaimedLessThanMaxTimesThisMonth(autoApprovalData)
    expect(checkResult.result).toBe(true)
  })

  it(`should return true if the number of claims made for the current month is less than ${MAX_NUMBER_OF_CLAIMS_PER_MONTH}`, function () {
    const firstOfCurrentMonth = dateFormatter.now().startOf('month')
    const autoApprovalData = generateAutoApprovalDataWithPreviousClaims(3, firstOfCurrentMonth)

    const checkResult = hasClaimedLessThanMaxTimesThisMonth(autoApprovalData)
    expect(checkResult.result).toBe(true)
  })

  it('should return true if the number of claims made for the current month is zero', function () {
    const autoApprovalData = {
      previousClaims: []
    }
    const checkResult = hasClaimedLessThanMaxTimesThisMonth(autoApprovalData)
    expect(checkResult.result).toBe(true)
  })

  it('should return true if the claimant has claimed the max number of claims this month, and submits an advance claim that falls outside the claimable month', function () {
    const firstOfCurrentMonth = dateFormatter.now().startOf('month')
    const secondOfNextMonth = dateFormatter.now().startOf('month').add('1', 'months').add('1', 'days')
    const autoApprovalData = generateAutoApprovalDataWithPreviousClaims(4, firstOfCurrentMonth)
    autoApprovalData.Claim.DateOfJourney = secondOfNextMonth.toDate()

    const checkResult = hasClaimedLessThanMaxTimesThisMonth(autoApprovalData)
    expect(checkResult.result).toBe(true)
  })
})

function generateAutoApprovalDataWithPreviousClaims (numberOfClaims, startDate) {
  const firstOfCurrentMonth = dateFormatter.now().startOf('month')
  const now = dateFormatter.now()
  const result = {

    Claim: {
      Reference: 'ABC123',
      DateOfJourney: firstOfCurrentMonth.clone().toDate()
    },
    previousClaims: [],
    maxNumberOfClaimsPerMonth: MAX_NUMBER_OF_CLAIMS_PER_MONTH
  }

  const durationSinceStartDate = now.diff(startDate, 'days')
  const daysBetweenClaims = Math.floor(durationSinceStartDate / numberOfClaims)

  for (let i = 0; i < numberOfClaims - 1; i++) {
    const claim = {
      ClaimId: initialClaimId + i,
      DateSubmitted: startDate.add((daysBetweenClaims), 'days').toDate(),
      Status: claimStatusEnum.APPROVED
    }

    result.previousClaims.push(claim)
  }

  return result
}
