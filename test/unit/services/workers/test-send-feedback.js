const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const config = require('../../../../config')
const RatingEnum = require('../../../../app/constants/rating-enum')

var rating = RatingEnum['satisfied'].databaseValue
var improvements = 'This is a test message'
var additionalData = `${rating}~~${improvements}`

var stubSendNotification = sinon.stub().resolves()

const sendFeedback = proxyquire('../../../../app/services/workers/send-feedback', {
  '../notify/send-notification': stubSendNotification
})

describe('services/send-feedback', function () {
  it('should call send-notification with correct details', function () {
    return sendFeedback.execute({additionalData: additionalData})
      .then(function () {
        expect(stubSendNotification.called).to.be.true
        expect(stubSendNotification.firstCall.args[0]).to.be.equal(config.NOTIFY_SEND_FEEDBACK_EMAIL_TEMPLATE_ID)
        expect(stubSendNotification.firstCall.args[1]).to.be.equal(config.APVS_FEEDBACK_EMAIL_ADDRESS)
        expect(stubSendNotification.firstCall.args[2].rating).to.be.equal(RatingEnum[rating].displayName)
        expect(stubSendNotification.firstCall.args[2].improvements).to.be.equal(improvements)
      })
  })
})
