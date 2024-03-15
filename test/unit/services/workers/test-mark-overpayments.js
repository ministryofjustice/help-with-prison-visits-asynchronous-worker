const config = { MARK_AS_OVERPAYMENT_DAYS: '10' }
let getAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmountStub
jest.mock('../../../config', () => config)

describe('services/workers/mark-overpayments', function () {
  let markOverpayments
  let updateOverpaymentStatusStub

  const claim1 = { ClaimId: 1, Reference: 'MARKING', Amount: 100 }
  const claim2 = { ClaimId: 2, Reference: 'M@RKING', Amount: 104 }
  const claims = [claim1, claim2]

  beforeEach(function () {
    getAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmountStub = jest.fn().mockResolvedValue(claims)
    updateOverpaymentStatusStub = jest.fn().mockResolvedValue()

    markOverpayments = require('../../../../app/services/workers/mark-overpayments')
  })

  it('find all claims that are should be overpaid, then adds a task to mark them', function () {
    return markOverpayments.markOverpayments()
      .then(function () {
        expect(getAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmountStub.calledOnce).toBe(true) //eslint-disable-line
        expect(updateOverpaymentStatusStub.calledTwice).toBe(true) //eslint-disable-line
      })
  })
})
