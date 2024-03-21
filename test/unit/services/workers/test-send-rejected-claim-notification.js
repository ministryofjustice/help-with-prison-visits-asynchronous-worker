const config = require('../../../../config')

const EMAIL_ADDRESS = 'test@test.com'
const REFERENCE = '1234567'
const CLAIM_ID = 1234
const ELIGIBILITY_ID = 4321
const FIRST_NAME = 'Joe'

const mockSendNotification = jest.fn().mockResolvedValue()
const mockGetFirstNameByClaimId = jest.fn().mockResolvedValue(FIRST_NAME)

jest.mock('../../../../app/services/notify/send-notification', () => mockSendNotification)
jest.mock('../../../../app/services/data/get-first-name-by-claimId', () => mockGetFirstNameByClaimId)

const sendRejectedClaimNotification = require('../../../../app/services/workers/send-rejected-claim-notification')

describe('services/send-rejected-claim-notification', function () {
  it('should call send-notification with correct details', function () {
    return sendRejectedClaimNotification.execute({
      reference: REFERENCE,
      claimId: CLAIM_ID,
      eligibilityId: ELIGIBILITY_ID,
      additionalData: EMAIL_ADDRESS
    })
      .then(function () {
        expect(mockGetFirstNameByClaimId).toHaveBeenCalledWith('IntSchema', CLAIM_ID) //eslint-disable-line
        expect(mockSendNotification).toHaveBeenCalled() //eslint-disable-line
        expect(mockSendNotification.mock.calls[0][0]).toBe(config.NOTIFY_REJECTED_CLAIM_EMAIL_TEMPLATE_ID)
        expect(mockSendNotification.mock.calls[0][1]).toBe(EMAIL_ADDRESS)
        expect(mockSendNotification.mock.calls[0][2].reference).toBe(REFERENCE)
        expect(mockSendNotification.mock.calls[0][2].first_name).toBe(FIRST_NAME)
        expect(mockSendNotification.mock.calls[0][2].requestInfoUrl).not.toBeNull() //eslint-disable-line
      })
  })
})
