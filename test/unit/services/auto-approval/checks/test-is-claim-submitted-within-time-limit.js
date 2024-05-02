const moment = require('moment')
const dateFormatter = require('../../../../../app/services/date-formatter')
const isClaimSubmittedWithinTimeLimit = require('../../../../../app/services/auto-approval/checks/is-claim-submitted-within-time-limit')

const validAutoApprovalData = {
  Claim: {
    Reference: 'ABC123',
    ClaimId: 1,
    DateSubmitted: dateFormatter.now().subtract(2, 'days').toDate(),
  },
  latestManuallyApprovedClaim: {
    DateReviewed: dateFormatter.now().subtract(30, 'days').toDate(),
  },
  maxDaysAfterAPVUVisit: '28',
}

const invalidAutoApprovalData = {
  Claim: {
    Reference: 'ABC123',
    ClaimId: 2,
    DateSubmitted: dateFormatter.now().subtract(1, 'days').toDate(),
  },
  latestManuallyApprovedClaim: {
    DateReviewed: dateFormatter.now().subtract(30, 'days').toDate(),
  },
  maxDaysAfterAPVUVisit: '28',
}

describe('services/auto-approval/checks/is-claim-submitted-within-time-limit', function () {
  it('should return true if the submission date is less than or equal to maxDayAfterAPVUVisit days after the date of journey of last manually approved claim', function () {
    const checkResult = isClaimSubmittedWithinTimeLimit(validAutoApprovalData)
    expect(checkResult.result).toBe(true)
  })

  it('should return false if the submission date is greater than maxDayAfterAPVUVisit days after the date of journey of last manually approved claim', function () {
    const checkResult = isClaimSubmittedWithinTimeLimit(invalidAutoApprovalData)
    expect(checkResult.result).toBe(false)
    expect(checkResult.failureMessage).toBe(
      `Claim was not submitted with the time limit. Claim ref: ABC123, Claim submission date: ${moment(invalidAutoApprovalData.Claim.DateSubmitted).format('DD/MM/YYYY')}, Claim submission cut off date: ${moment(invalidAutoApprovalData.latestManuallyApprovedClaim.DateReviewed).add(invalidAutoApprovalData.maxDaysAfterAPVUVisit, 'days').format('DD/MM/YYYY')}`,
    )
  })
})
