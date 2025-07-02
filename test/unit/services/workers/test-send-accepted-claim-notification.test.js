const paymentMethodEnum = require('../../../../app/constants/payment-method-enum')
const prisonsEnum = require('../../../../app/constants/prisons-enum')

const config = require('../../../../config')

const EMAIL_ADDRESS = 'test@test.com'
const REFERENCE = '1234567'
const ELIGIBILITY_ID = 4321
const CLAIM_ID = 1234

const mockSendNotification = jest.fn()
const mockGetApprovedClaimExpenseData = jest.fn()
const mockGetApprovedClaimDetailsString = jest.fn()
const mockGetEnabledClaimDeductions = jest.fn()

const BANK_DATA_PAST = {
  VisitorFirstName: 'Joe',
  AccountNumberLastFourDigits: '1234',
  PaymentMethod: paymentMethodEnum.DIRECT_BANK_PAYMENT.value,
  IsAdvanceClaim: false,
}
const PAYOUT_DATA_PAST = {
  VisitorFirstName: 'Joe',
  PaymentMethod: paymentMethodEnum.PAYOUT.value,
  Town: 'Town',
  Prison: prisonsEnum.HEWELL.value,
  IsAdvanceClaim: false,
}
const BANK_DATA_ADVANCE = {
  VisitorFirstName: 'Joe',
  AccountNumberLastFourDigits: '1234',
  PaymentMethod: paymentMethodEnum.DIRECT_BANK_PAYMENT.value,
  IsAdvanceClaim: true,
}
const PAYOUT_DATA_ADVANCE = {
  VisitorFirstName: 'Joe',
  PaymentMethod: paymentMethodEnum.PAYOUT.value,
  Town: 'Town',
  Prison: prisonsEnum.HEWELL.value,
  IsAdvanceClaim: true,
}

let sendAcceptedClaimNotification

describe('services/send-accepted-claim-notification', () => {
  beforeEach(() => {
    mockSendNotification.mockResolvedValue()
    mockGetApprovedClaimDetailsString.mockReturnValue('string with payment breakdown')
    mockGetEnabledClaimDeductions.mockResolvedValue([])

    jest.mock('../../../../app/services/notify/send-notification', () => mockSendNotification)
    jest.mock('../../../../app/services/data/get-approved-claim-expense-data', () => mockGetApprovedClaimExpenseData)
    jest.mock(
      '../../../../app/services/notify/helpers/get-approved-claim-details-string',
      () => mockGetApprovedClaimDetailsString,
    )
    jest.mock('../../../../app/services/data/get-enabled-claim-deductions', () => mockGetEnabledClaimDeductions)

    sendAcceptedClaimNotification = require('../../../../app/services/workers/send-accepted-claim-notification')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should call send-notification with correct details for retro bank payment', () => {
    mockGetApprovedClaimExpenseData.mockResolvedValue({
      claimantData: BANK_DATA_PAST,
      claimExpenseData: [{ ClaimExpenseId: 1 }],
    })
    return sendAcceptedClaimNotification
      .execute({
        reference: REFERENCE,
        eligibilityId: ELIGIBILITY_ID,
        additionalData: EMAIL_ADDRESS,
        claimId: CLAIM_ID,
      })
      .then(() => {
        expect(mockSendNotification).toHaveBeenCalledTimes(1)
        expect(mockSendNotification.mock.calls[0][0]).toBe(config.NOTIFY_ACCEPTED_CLAIM_BANK_EMAIL_TEMPLATE_ID)
        expect(mockSendNotification.mock.calls[0][1]).toBe(EMAIL_ADDRESS)
        expect(mockSendNotification.mock.calls[0][2].reference).toBe(REFERENCE)
        expect(mockGetApprovedClaimExpenseData).toHaveBeenCalledTimes(1)
        expect(mockGetApprovedClaimDetailsString).toHaveBeenCalledTimes(1)
        expect(mockGetEnabledClaimDeductions).toHaveBeenCalledTimes(1)
      })
  })

  it('should call send-notification with correct details for advance bank payment', () => {
    mockGetApprovedClaimExpenseData.mockResolvedValue({
      claimantData: BANK_DATA_ADVANCE,
      claimExpenseData: [{ ClaimExpenseId: 1 }],
    })
    return sendAcceptedClaimNotification
      .execute({
        reference: REFERENCE,
        eligibilityId: ELIGIBILITY_ID,
        additionalData: EMAIL_ADDRESS,
        claimId: CLAIM_ID,
      })
      .then(() => {
        expect(mockSendNotification).toHaveBeenCalledTimes(1)
        expect(mockSendNotification.mock.calls[0][0]).toBe(config.NOTIFY_ACCEPTED_CLAIM_ADVANCE_BANK_EMAIL_TEMPLATE_ID)
        expect(mockSendNotification.mock.calls[0][1]).toBe(EMAIL_ADDRESS)
        expect(mockSendNotification.mock.calls[0][2].reference).toBe(REFERENCE)
        expect(mockGetApprovedClaimExpenseData).toHaveBeenCalledTimes(1)
        expect(mockGetApprovedClaimDetailsString).not.toHaveBeenCalledTimes(1)
        expect(mockGetEnabledClaimDeductions).toHaveBeenCalledTimes(1)
      })
  })

  it('should call send-notification with correct details for retro payout payment', () => {
    mockGetApprovedClaimExpenseData.mockResolvedValue({
      claimantData: PAYOUT_DATA_PAST,
      claimExpenseData: [{ ClaimExpenseId: 1 }],
    })
    return sendAcceptedClaimNotification
      .execute({
        reference: REFERENCE,
        eligibilityId: ELIGIBILITY_ID,
        additionalData: EMAIL_ADDRESS,
        claimId: CLAIM_ID,
      })
      .then(() => {
        expect(mockSendNotification).toHaveBeenCalledTimes(1)
        expect(mockSendNotification.mock.calls[0][0]).toBe(config.NOTIFY_ACCEPTED_CLAIM_PAYOUT_EMAIL_TEMPLATE_ID)
        expect(mockSendNotification.mock.calls[0][1]).toBe(EMAIL_ADDRESS)
        expect(mockSendNotification.mock.calls[0][2].reference).toBe(REFERENCE)
        expect(mockGetApprovedClaimExpenseData).toHaveBeenCalledTimes(1)
        expect(mockGetApprovedClaimDetailsString).toHaveBeenCalledTimes(1)
        expect(mockGetEnabledClaimDeductions).toHaveBeenCalledTimes(1)
      })
  })

  it('should call send-notification with correct details for advance payout payment', () => {
    mockGetApprovedClaimExpenseData.mockResolvedValue({
      claimantData: PAYOUT_DATA_ADVANCE,
      claimExpenseData: [{ ClaimExpenseId: 1 }],
    })
    return sendAcceptedClaimNotification
      .execute({
        reference: REFERENCE,
        eligibilityId: ELIGIBILITY_ID,
        additionalData: EMAIL_ADDRESS,
        claimId: CLAIM_ID,
      })
      .then(() => {
        expect(mockSendNotification).toHaveBeenCalledTimes(1)
        expect(mockSendNotification.mock.calls[0][0]).toBe(
          config.NOTIFY_ACCEPTED_CLAIM_ADVANCE_PAYOUT_EMAIL_TEMPLATE_ID,
        )
        expect(mockSendNotification.mock.calls[0][1]).toBe(EMAIL_ADDRESS)
        expect(mockSendNotification.mock.calls[0][2].reference).toBe(REFERENCE)
        expect(mockGetApprovedClaimExpenseData).toHaveBeenCalledTimes(1)
        expect(mockGetApprovedClaimDetailsString).not.toHaveBeenCalledTimes(1)
        expect(mockGetEnabledClaimDeductions).toHaveBeenCalledTimes(1)
      })
  })

  it('should reject if there is no payment method', () => {
    mockGetApprovedClaimExpenseData.mockResolvedValue({ claimantData: {}, claimExpenseData: [] })
    return sendAcceptedClaimNotification
      .execute({
        reference: REFERENCE,
        eligibilityId: ELIGIBILITY_ID,
        additionalData: EMAIL_ADDRESS,
        claimId: CLAIM_ID,
      })
      .catch(error => {
        expect(error.message).toBe('No payment method found')
        expect(mockSendNotification).not.toHaveBeenCalledTimes(1)
      })
  })
})
