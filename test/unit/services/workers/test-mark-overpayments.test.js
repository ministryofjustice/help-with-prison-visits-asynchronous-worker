const mockConfig = { MARK_AS_OVERPAYMENT_DAYS: '10' }
let mockGetAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmount

describe('services/workers/mark-overpayments', () => {
  let markOverpayments
  let mockUpdateOverpaymentStatus

  const claim1 = { ClaimId: 1, Reference: 'MARKING', Amount: 100 }
  const claim2 = { ClaimId: 2, Reference: 'M@RKING', Amount: 104 }
  const claims = [claim1, claim2]

  beforeEach(() => {
    mockGetAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmount = jest.fn().mockResolvedValue(claims)
    mockUpdateOverpaymentStatus = jest.fn().mockResolvedValue()

    jest.mock('../../../../config', () => mockConfig)
    jest.mock(
      '../../../../app/services/data/get-advance-claims-total-expense-approved-cost-before-date',
      () => mockGetAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmount,
    )
    jest.mock('../../../../app/services/data/update-overpayment-status', () => mockUpdateOverpaymentStatus)

    markOverpayments = require('../../../../app/services/workers/mark-overpayments')
  })

  it('find all claims that are should be overpaid, then adds a task to mark them', () => {
    return markOverpayments.markOverpayments().then(() => {
      expect(mockGetAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmount).toHaveBeenCalledTimes(1)
      expect(mockUpdateOverpaymentStatus).toHaveBeenCalledTimes(2)
    })
  })
})
