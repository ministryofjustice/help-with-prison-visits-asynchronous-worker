const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')


const REFERENCE = 'RECOVERY'
const EMAIL = 'test@test.com'
const PRISON_NUMBER = 'B123456'
const FIRST_NAME = 'test'

var additionalData = `${EMAIL}~~${PRISON_NUMBER}`
var config = { EXTERNAL_SERVICE_URL: 'https://test.com', EXTERNAL_PATH_ALREADY_REGISTERED: '/start-already-registered' }

var stubReferenceNumberRecovery
var stubSendNotification
var referenceRecovery

describe('services/reference-recovery', function () {
  beforeEach(function () {
    stubReferenceNumberRecovery = sinon.stub()
    stubSendNotification = sinon.stub().resolves()

    referenceRecovery = proxyquire('../../../../app/services/workers/reference-recovery', {
      '../data/reference-number-recovery': stubReferenceNumberRecovery,
      '../../../config': config,
      '../notify/send-notification': stubSendNotification
    })
  })

  it('should call reference number recovery send email with recovered reference number', function () {
    stubReferenceNumberRecovery.resolves({ Reference: REFERENCE, FirstName: FIRST_NAME })
    return referenceRecovery.execute({ additionalData: additionalData })
      .then(function () {
        expect(stubReferenceNumberRecovery.calledWith(EMAIL, PRISON_NUMBER))
        expect(stubSendNotification.called).to.be.true //eslint-disable-line
        expect(stubSendNotification.firstCall.args[0]).to.be.equal(config.NOTIFY_SEND_REFERENCE_RECOVERY_EMAIL_TEMPLATE_ID)
        expect(stubSendNotification.firstCall.args[1]).to.be.equal(EMAIL)
        expect(stubSendNotification.firstCall.args[2].reference).to.be.equal(REFERENCE)
        expect(stubSendNotification.firstCall.args[2].firstname).to.be.equal(FIRST_NAME)
        expect(stubSendNotification.firstCall.args[2].registeredUrl).to.be.equal(`${config.EXTERNAL_SERVICE_URL}${config.EXTERNAL_PATH_ALREADY_REGISTERED}`)
      })
  })

  it('should only call reference recover, get nothing and send no email', function () {
    stubReferenceNumberRecovery.resolves()
    return referenceRecovery.execute({ additionalData: additionalData })
      .then(function () {
        expect(stubReferenceNumberRecovery.calledWith(EMAIL, PRISON_NUMBER))
        expect(stubSendNotification.called).to.be.false //eslint-disable-line
      })
  })
})
