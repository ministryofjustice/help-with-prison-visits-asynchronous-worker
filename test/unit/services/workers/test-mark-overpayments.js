const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')

describe('services/workers/mark-overpayments', function () {
  var markOverpayments
  var getAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmountStub
  var updateOverpaymentStatusStub

  var config = { MARK_AS_OVERPAYMENT_DAYS: '10' }

  const claim1 = { ClaimId: 1, Reference: 'MARKING', Amount: 100 }
  const claim2 = { ClaimId: 2, Reference: 'M@RKING', Amount: 104 }
  const claims = [claim1, claim2]

  beforeEach(function () {
    getAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmountStub = sinon.stub().resolves(claims)
    updateOverpaymentStatusStub = sinon.stub().resolves()

    markOverpayments = proxyquire('../../../../app/services/workers/mark-overpayments', {
      '../../../config': config,
      '../data/get-advance-claims-total-expense-approved-cost-before-date': getAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmountStub,
      '../data/update-overpayment-status': updateOverpaymentStatusStub
    })
  })

  it('find all claims that are should be overpaid, then adds a task to mark them', function () {
    return markOverpayments.execute()
      .then(function () {
        expect(getAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmountStub.calledOnce).to.be.true //eslint-disable-line
        expect(updateOverpaymentStatusStub.calledTwice).to.be.true //eslint-disable-line
      })
  })
})
