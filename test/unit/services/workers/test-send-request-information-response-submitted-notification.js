const config = require('../../../../config')

const EMAIL_ADDRESS = 'test@test.com'
const REFERENCE = '1234567'
const CLAIM_ID = 1234
const ELIGIBILITY_ID = 4321
const FIRST_NAME = 'Joe'

const stubSendNotification = jest.fn().mockResolvedValue()
const stubGetFirstNameByClaimId = jest.fn().mockResolvedValue(FIRST_NAME)

jest.mock('../notify/send-notification', () => stubSendNotification)
jest.mock('../data/get-first-name-by-claimId', () => stubGetFirstNameByClaimId)

const sendRequestInformationResponseSubmittedNotification = require(
  '../../../../app/services/workers/send-request-information-response-submitted-notification'
)

describe('services/send-request-information-response-submitted-notification', function () {
  it('should call send-notification with correct details', function () {
    return sendRequestInformationResponseSubmittedNotification.execute({
      reference: REFERENCE,
      claimId: CLAIM_ID,
      eligibilityId: ELIGIBILITY_ID,
      additionalData: EMAIL_ADDRESS
    })
      .then(function () {
        expect(stubGetFirstNameByClaimId.calledWith('IntSchema', CLAIM_ID)).toBe(true) //eslint-disable-line
        expect(stubSendNotification.called).toBe(true) //eslint-disable-line
        expect(stubSendNotification.firstCall.args[0]).toBe(config.NOTIFY_REQUEST_INFORMATION_RESPONSE_SUBMITTED_EMAIL_TEMPLATE_ID)
        expect(stubSendNotification.firstCall.args[1]).toBe(EMAIL_ADDRESS)
        expect(stubSendNotification.firstCall.args[2].reference).toBe(REFERENCE)
        expect(stubSendNotification.firstCall.args[2].first_name).toBe(FIRST_NAME)
        expect(stubSendNotification.firstCall.args[2].requestInfoUrl).not.toBeNull() //eslint-disable-line
      })
  })
})
