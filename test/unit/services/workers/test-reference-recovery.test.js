const REFERENCE = 'RECOVERY'
const EMAIL = 'test@test.com'
const PRISON_NUMBER = 'B123456'
const FIRST_NAME = 'test'

const additionalData = `${EMAIL}~~${PRISON_NUMBER}`
const config = {
  EXTERNAL_SERVICE_URL: 'https://test.com',
  EXTERNAL_PATH_ALREADY_REGISTERED: '/start-already-registered',
}

const mockReferenceNumberRecovery = jest.fn()
const mockSendNotification = jest.fn().mockResolvedValue()
let referenceRecovery

jest.mock('../../../../app/services/data/reference-number-recovery', () => mockReferenceNumberRecovery)
jest.mock('../../../../config', () => config)
jest.mock('../../../../app/services/notify/send-notification', () => mockSendNotification)

describe('services/reference-recovery', () => {
  beforeEach(() => {
    referenceRecovery = require('../../../../app/services/workers/reference-recovery')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call reference number recovery send email with recovered reference number', () => {
    mockReferenceNumberRecovery.mockResolvedValue({ Reference: REFERENCE, FirstName: FIRST_NAME })
    return referenceRecovery.execute({ additionalData }).then(() => {
      expect(mockReferenceNumberRecovery).toHaveBeenCalledWith(EMAIL, PRISON_NUMBER)
      expect(mockSendNotification).toHaveBeenCalled()
      expect(mockSendNotification.mock.calls[0][0]).toBe(config.NOTIFY_SEND_REFERENCE_RECOVERY_EMAIL_TEMPLATE_ID)
      expect(mockSendNotification.mock.calls[0][1]).toBe(EMAIL)
      expect(mockSendNotification.mock.calls[0][2].reference).toBe(REFERENCE)
      expect(mockSendNotification.mock.calls[0][2].firstname).toBe(FIRST_NAME)
      expect(mockSendNotification.mock.calls[0][2].registeredUrl).toBe(
        `${config.EXTERNAL_SERVICE_URL}${config.EXTERNAL_PATH_ALREADY_REGISTERED}`,
      )
    })
  })

  it('should only call reference recover, get nothing and send no email', () => {
    mockReferenceNumberRecovery.mockResolvedValue()
    return referenceRecovery.execute({ additionalData }).then(() => {
      expect(mockReferenceNumberRecovery).toHaveBeenCalledWith(EMAIL, PRISON_NUMBER)
      expect(mockSendNotification).not.toHaveBeenCalled()
    })
  })
})
