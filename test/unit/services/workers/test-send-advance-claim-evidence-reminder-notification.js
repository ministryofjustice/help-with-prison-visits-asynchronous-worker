const reminderEnum = require('../../../../app/constants/advance-claim-reminder-enum')
const config = require('../../../../config')

const EMAIL_ADDRESS = 'test@test.com'
const REFERENCE = '1234567'
const ELIGIBILITY_ID = 4321
const CLAIM_ID = 1234
const FIRST_NAME = 'Joe'

const dateOfJourney = new Date('2016-02-01')
const dateOfJourneyString = '1 February 2016'

let mockGetClaim
let mockSendNotification
let mockGetFirstNameByClaimId

let sendRequestInformationClaimNotification

describe('services/send-advance-claim-evidence-reminder-notification', function () {
  beforeEach(function () {
    mockGetClaim = jest.fn().mockResolvedValue({ DateOfJourney: dateOfJourney })
    mockSendNotification = jest.fn().mockResolvedValue()
    mockGetFirstNameByClaimId = jest.fn().mockResolvedValue(FIRST_NAME)

    jest.mock('../../../../app/services/data/get-claim', () => mockGetClaim)
    jest.mock('../../../../app/services/data/get-first-name-by-claimId', () => mockGetFirstNameByClaimId)
    jest.mock('../../../../app/services/notify/send-notification', () => mockSendNotification)

    sendRequestInformationClaimNotification = require(
      '../../../../app/services/workers/send-advance-claim-evidence-reminder-notification'
    )
  })

  it('should call send-notification with correct details for first reminder', function () {
    return sendRequestInformationClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      claimId: CLAIM_ID,
      additionalData: `${EMAIL_ADDRESS}~~${reminderEnum.FIRST}`
    })
      .then(function () {
        expect(mockGetClaim).toHaveBeenCalledWith('IntSchema', CLAIM_ID) //eslint-disable-line
        expect(mockSendNotification).toHaveBeenCalled() //eslint-disable-line
        expect(mockSendNotification.mock.calls[0][0]).toBe(config.NOTIFY_ADVANCE_CLAIM_EVIDENCE_REMINDER_TEMPLATE_ID)
        expect(mockSendNotification.mock.calls[0][1]).toBe(EMAIL_ADDRESS)
        expect(mockSendNotification.mock.calls[0][2].reference).toBe(REFERENCE)
        expect(mockSendNotification.mock.calls[0][2].dateOfJourney).toBe(dateOfJourneyString)
        expect(mockSendNotification.mock.calls[0][2].requestInfoUrl).not.toBeNull() //eslint-disable-line
        expect(mockSendNotification.mock.calls[0][2].first_name).toBe(FIRST_NAME)
      })
  })

  it('should call send-notification with correct details for second reminder', function () {
    return sendRequestInformationClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      claimId: CLAIM_ID,
      additionalData: `${EMAIL_ADDRESS}~~${reminderEnum.SECOND}`
    })
      .then(function () {
        expect(mockGetClaim).toHaveBeenCalledWith('IntSchema', CLAIM_ID) //eslint-disable-line
        expect(mockSendNotification).toHaveBeenCalled() //eslint-disable-line
        expect(mockSendNotification.mock.calls[0][0]).toBe(config.NOTIFY_ADVANCE_CLAIM_SECOND_EVIDENCE_REMINDER_TEMPLATE_ID)
        expect(mockSendNotification.mock.calls[0][1]).toBe(EMAIL_ADDRESS)
        expect(mockSendNotification.mock.calls[0][2].reference).toBe(REFERENCE)
        expect(mockSendNotification.mock.calls[0][2].dateOfJourney).toBe(dateOfJourneyString)
        expect(mockSendNotification.mock.calls[0][2].requestInfoUrl).not.toBeNull() //eslint-disable-line
        expect(mockSendNotification.mock.calls[0][2].first_name).toBe(FIRST_NAME)
      })
  })

  it('should reject the call if an invalid reminder type is sent', function () {
    return sendRequestInformationClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      claimId: CLAIM_ID,
      additionalData: `${EMAIL_ADDRESS}~~NotValid`
    })
      .catch(function (error) {
        expect(error.message).toBe('Not valid reminder type')
        expect(mockSendNotification.calledOnce).toBe(false) //eslint-disable-line
      })
  })
})
