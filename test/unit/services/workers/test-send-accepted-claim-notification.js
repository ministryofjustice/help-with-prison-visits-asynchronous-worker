const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const config = require('../../../../config')

var emailAddress = 'test@test.com'
var reference = '1234567'
var eligibilityId = '4321'
var claimId = 0

var stubSendNotification = sinon.stub().resolves()
var stubGetApprovedClaimExpenseData = sinon.stub().resolves({
  claimantData: {
    'VisitorFirstName': 'Joe',
    'AccountNumberLastFourDigits': '1234'
  },
  claimExpenseData: [{ClaimExpenseId: 1}]
})
var stubGetApprovedClaimDetailsString = sinon.stub().returns('string with payment breakdown')

const sendAcceptedClaimNotification = proxyquire('../../../../app/services/workers/send-accepted-claim-notification', {
  '../notify/send-notification': stubSendNotification,
  '../data/get-approved-claim-expense-data': stubGetApprovedClaimExpenseData,
  '../notify/helpers/get-approved-claim-details-string': stubGetApprovedClaimDetailsString
})

describe('services/send-accepted-claim-notification', function () {
  it('should call send-notification with correct details', function () {
    return sendAcceptedClaimNotification.execute({
      reference: reference,
      eligibilityId: eligibilityId,
      additionalData: emailAddress,
      claimId: claimId
    })
    .then(function () {
      expect(stubSendNotification.calledOnce).to.be.true
      expect(stubSendNotification.firstCall.args[0]).to.be.equal(config.NOTIFY_ACCEPTED_CLAIM_EMAIL_TEMPLATE_ID)
      expect(stubSendNotification.firstCall.args[1]).to.be.equal(emailAddress)
      expect(stubSendNotification.firstCall.args[2].reference).to.be.equal(reference)
      expect(stubGetApprovedClaimExpenseData.calledOnce).to.be.true
      expect(stubGetApprovedClaimDetailsString.calledOnce).to.be.true
    })
  })
})
