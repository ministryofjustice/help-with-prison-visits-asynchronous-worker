const moment = require('moment')
const dateFormatter = require('../../../../../app/services/date-formatter')
const isBenefitExpiryDateInFuture = require('../../../../../app/services/auto-approval/checks/is-benefit-expiry-date-in-future')

const autoApprovalData = {
  Claim: {
    Reference: 'ABC123',
    DateOfJourney: dateFormatter.now().subtract(5, 'days'),
  },
  Visitor: {
    BenefitExpiryDate: dateFormatter.now().subtract(2, 'days'),
  },
}

describe('services/auto-approval/checks/is-benefit-expiry-date-in-future', () => {
  it('should return true if the benefit expiry date is after date of journey', () => {
    const checkResult = isBenefitExpiryDateInFuture(autoApprovalData)
    expect(checkResult.result).toBe(true)
  })
  it('should return true if the benefit expiry date is same as date of journey', () => {
    autoApprovalData.Visitor.BenefitExpiryDate = dateFormatter.now().subtract(5, 'days')
    const checkResult = isBenefitExpiryDateInFuture(autoApprovalData)
    expect(checkResult.result).toBe(true)
  })
  it('should return false if the date of journey is after benefit expiry date', () => {
    autoApprovalData.Visitor.BenefitExpiryDate = dateFormatter.now().subtract(7, 'days')
    const checkResult = isBenefitExpiryDateInFuture(autoApprovalData)
    expect(checkResult.result).toBe(false)
    expect(checkResult.failureMessage).toBe(
      `The visit date is after the benefit expiry date. Claim ref: ABC123, Benefit expiry date: ${moment(autoApprovalData.Visitor.BenefitExpiryDate).format('DD/MM/YYYY')}, Date of journey: ${moment(autoApprovalData.Claim.DateOfJourney).format('DD/MM/YYYY')}`,
    )
  })
})
