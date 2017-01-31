const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const config = require('../../../../config')

var emailAddress = 'test@test.com'
var reference = '1234567'
var eligibilityId = '4321'
var firstName = 'Joe'

var stubSendNotification = sinon.stub().resolves()
var stubGetFirstNameByReference = sinon.stub().resolves({
  'FirstName': firstName
})

const sendRejectedClaimNotification = proxyquire('../../../../app/services/workers/send-rejected-claim-notification', {
  '../notify/send-notification': stubSendNotification,
  '../data/get-first-name-by-reference': stubGetFirstNameByReference
})

describe('services/send-rejected-claim-notification', function () {
  it('should call send-notification with correct details', function () {
    return sendRejectedClaimNotification.execute({
      reference: reference,
      eligibilityId: eligibilityId,
      additionalData: emailAddress
    })
    .then(function () {
      expect(stubSendNotification.called).to.be.true
      expect(stubSendNotification.firstCall.args[0]).to.be.equal(config.NOTIFY_REJECTED_CLAIM_EMAIL_TEMPLATE_ID)
      expect(stubSendNotification.firstCall.args[1]).to.be.equal(emailAddress)
      expect(stubSendNotification.firstCall.args[2].reference).to.be.equal(reference)
      expect(stubSendNotification.firstCall.args[2].first_name).to.be.equal(firstName)
      expect(stubSendNotification.firstCall.args[2].requestInfoUrl).not.to.be.null
    })
  })
})
