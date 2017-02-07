const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const config = require('../../../../config')

const EMAIL_ADDRESS = 'test@test.com'
const REFERENCE = '1234567'
const ELIGIBILITY_ID = 4321
const CLAIM_ID = 1234

var stubSendNotification = sinon.stub().resolves()
var stubGetApprovedClaimExpenseData = sinon.stub().resolves({
  claimantData: {
    'VisitorFirstName': 'Joe',
    'AccountNumberLastFourDigits': '1234'
  },
  claimExpenseData: [{ClaimExpenseId: 1}]
})
var stubGetApprovedClaimDetailsString = sinon.stub().returns('string with payment breakdown')
var stubGetEnabledClaimDeductions = sinon.stub().resolves([])

const sendAcceptedClaimNotification = proxyquire('../../../../app/services/workers/send-accepted-claim-notification', {
  '../notify/send-notification': stubSendNotification,
  '../data/get-approved-claim-expense-data': stubGetApprovedClaimExpenseData,
  '../notify/helpers/get-approved-claim-details-string': stubGetApprovedClaimDetailsString,
  '../data/get-enabled-claim-deductions': stubGetEnabledClaimDeductions
})

describe('services/send-accepted-claim-notification', function () {
  it('should call send-notification with correct details', function () {
    return sendAcceptedClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      additionalData: EMAIL_ADDRESS,
      claimId: CLAIM_ID
    })
    .then(function () {
      expect(stubSendNotification.calledOnce).to.be.true
      expect(stubSendNotification.firstCall.args[0]).to.be.equal(config.NOTIFY_ACCEPTED_CLAIM_EMAIL_TEMPLATE_ID)
      expect(stubSendNotification.firstCall.args[1]).to.be.equal(EMAIL_ADDRESS)
      expect(stubSendNotification.firstCall.args[2].reference).to.be.equal(REFERENCE)
      expect(stubGetApprovedClaimExpenseData.calledOnce).to.be.true
      expect(stubGetApprovedClaimDetailsString.calledOnce).to.be.true
      expect(stubGetEnabledClaimDeductions.calledOnce).to.be.true
    })
  })
})
