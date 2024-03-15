const sinon = require('sinon')

const config = require('../../../../config')

const EMAIL_ADDRESS = 'test@test.com'
const REFERENCE = '1234567'
const CLAIM_ID = 1234
const ELIGIBILITY_ID = 4321
const FIRST_NAME = 'Joe'

const stubSendNotification = sinon.stub().resolves()
const stubGetFirstNameByClaimId = sinon.stub().resolves(FIRST_NAME)

jest.mock('../notify/send-notification', () => stubSendNotification);
jest.mock('../data/get-first-name-by-claimId', () => stubGetFirstNameByClaimId);

const sendClaimNotification = require('../../../../app/services/workers/send-claim-notification')

describe('services/send-claim-notification', function () {
  it('should call send-notification with correct details', function () {
    return sendClaimNotification.execute({
      reference: REFERENCE,
      claimId: CLAIM_ID,
      eligibilityId: ELIGIBILITY_ID,
      additionalData: EMAIL_ADDRESS
    })
      .then(function () {
        expect(stubGetFirstNameByClaimId.calledWith('IntSchema', CLAIM_ID)).toBe(true) //eslint-disable-line
        expect(stubSendNotification.called).toBe(true) //eslint-disable-line
        expect(stubSendNotification.firstCall.args[0]).toBe(config.NOTIFY_SUBMIT_CLAIM_EMAIL_TEMPLATE_ID)
        expect(stubSendNotification.firstCall.args[1]).toBe(EMAIL_ADDRESS)
        expect(stubSendNotification.firstCall.args[2].reference).toBe(REFERENCE)
        expect(stubSendNotification.firstCall.args[2].first_name).toBe(FIRST_NAME)
        expect(stubSendNotification.firstCall.args[2].requestInfoUrl).not.toBeNull() //eslint-disable-line
      });
  })
})
