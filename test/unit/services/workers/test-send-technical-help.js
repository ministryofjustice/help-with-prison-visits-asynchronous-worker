const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const config = require('../../../../config')

var name = 'Joe Bloggs'
var emailAddress = 'test@test.com'
var issue = 'This is a test message'
var additionalData = `${name}~~${emailAddress}~~${issue}`

var stubSendNotification = sinon.stub().resolves()

const sendFeedback = proxyquire('../../../../app/services/workers/send-technical-help', {
  '../notify/send-notification': stubSendNotification
})

describe('services/send-technical-help', function () {
  it('should call send-notification with correct details', function () {
    return sendFeedback.execute({additionalData: additionalData})
      .then(function () {
        expect(stubSendNotification.called).to.be.true
        expect(stubSendNotification.firstCall.args[0]).to.be.equal(config.NOTIFY_SEND_TECHNICAL_HELP_EMAIL_TEMPLATE_ID)
        expect(stubSendNotification.firstCall.args[1]).to.be.equal(config.APVS_FEEDBACK_EMAIL_ADDRESS)
        expect(stubSendNotification.firstCall.args[2].name).to.be.equal(name)
        expect(stubSendNotification.firstCall.args[2].contactEmailAddress).to.be.equal(emailAddress)
        expect(stubSendNotification.firstCall.args[2].issue).to.be.equal(issue)
      })
  })
})
