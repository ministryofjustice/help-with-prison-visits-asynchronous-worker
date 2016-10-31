const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const config = require('../../../../config')

var emailAddress = 'test@test.com'
var reference = '1234567'

var stubSendNotification = sinon.stub().resolves()

const sendFirstTimeClaimNotification = proxyquire('../../../../app/services/workers/send-first-time-claim-notification', {
  '../notify/send-notification': stubSendNotification
})

describe('services/send-first-time-claim-notification', function () {
  it('should call send-notification with correct details', function (done) {
    sendFirstTimeClaimNotification.execute({
      reference: reference,
      additionalData: emailAddress
    })
    .then(function () {
      expect(stubSendNotification.called).to.be.true
      expect(stubSendNotification.firstCall.args[0]).to.be.equal(config.NOTIFY_FIRST_TIME_CLAIM_EMAIL_TEMPLATE_ID)
      expect(stubSendNotification.firstCall.args[1]).to.be.equal(emailAddress)
      expect(stubSendNotification.firstCall.args[2].reference).to.be.equal(reference)

      done()
    })
  })
})
