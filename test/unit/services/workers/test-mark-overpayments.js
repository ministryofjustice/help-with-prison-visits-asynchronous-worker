const sinon = require('sinon')

jest.mock('../../../config', () => config);

jest.mock(
  '../data/get-advance-claims-total-expense-approved-cost-before-date',
  () => getAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmountStub
);

jest.mock('../data/update-overpayment-status', () => updateOverpaymentStatusStub);

describe('services/workers/mark-overpayments', function () {
  let markOverpayments
  let getAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmountStub
  let updateOverpaymentStatusStub

  const config = { MARK_AS_OVERPAYMENT_DAYS: '10' }

  const claim1 = { ClaimId: 1, Reference: 'MARKING', Amount: 100 }
  const claim2 = { ClaimId: 2, Reference: 'M@RKING', Amount: 104 }
  const claims = [claim1, claim2]

  beforeEach(function () {
    getAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmountStub = sinon.stub().resolves(claims)
    updateOverpaymentStatusStub = sinon.stub().resolves()

    markOverpayments = require('../../../../app/services/workers/mark-overpayments')
  })

  it('find all claims that are should be overpaid, then adds a task to mark them', function () {
    return markOverpayments.markOverpayments()
      .then(function () {
        expect(getAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmountStub.calledOnce).toBe(true) //eslint-disable-line
        expect(updateOverpaymentStatusStub.calledTwice).toBe(true) //eslint-disable-line
      });
  })
})
