const sinon = require('sinon')

const REFERENCE = 'RECOVERY'
const EMAIL = 'test@test.com'
const PRISON_NUMBER = 'B123456'
const FIRST_NAME = 'test'

const additionalData = `${EMAIL}~~${PRISON_NUMBER}`
const config = { EXTERNAL_SERVICE_URL: 'https://test.com', EXTERNAL_PATH_ALREADY_REGISTERED: '/start-already-registered' }

let stubReferenceNumberRecovery
let stubSendNotification
let referenceRecovery

jest.mock('../data/reference-number-recovery', () => stubReferenceNumberRecovery);
jest.mock('../../../config', () => config);
jest.mock('../notify/send-notification', () => stubSendNotification);

describe('services/reference-recovery', function () {
  beforeEach(function () {
    stubReferenceNumberRecovery = sinon.stub()
    stubSendNotification = sinon.stub().resolves()

    referenceRecovery = require('../../../../app/services/workers/reference-recovery')
  })

  it('should call reference number recovery send email with recovered reference number', function () {
    stubReferenceNumberRecovery.resolves({ Reference: REFERENCE, FirstName: FIRST_NAME })
    return referenceRecovery.execute({ additionalData })
      .then(function () {
        expect(stubReferenceNumberRecovery.calledWith(EMAIL, PRISON_NUMBER))
        expect(stubSendNotification.called).toBe(true) //eslint-disable-line
        expect(stubSendNotification.firstCall.args[0]).toBe(config.NOTIFY_SEND_REFERENCE_RECOVERY_EMAIL_TEMPLATE_ID)
        expect(stubSendNotification.firstCall.args[1]).toBe(EMAIL)
        expect(stubSendNotification.firstCall.args[2].reference).toBe(REFERENCE)
        expect(stubSendNotification.firstCall.args[2].firstname).toBe(FIRST_NAME)
        expect(stubSendNotification.firstCall.args[2].registeredUrl).toBe(`${config.EXTERNAL_SERVICE_URL}${config.EXTERNAL_PATH_ALREADY_REGISTERED}`)
      });
  })

  it('should only call reference recover, get nothing and send no email', function () {
    stubReferenceNumberRecovery.resolves()
    return referenceRecovery.execute({ additionalData })
      .then(function () {
        expect(stubReferenceNumberRecovery.calledWith(EMAIL, PRISON_NUMBER))
        expect(stubSendNotification.called).toBe(false) //eslint-disable-line
      });
  })
})
