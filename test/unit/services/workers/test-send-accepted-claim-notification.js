const paymentMethodEnum = require('../../../../app/constants/payment-method-enum')
const prisonsEnum = require('../../../../app/constants/prisons-enum')

const config = require('../../../../config')

const EMAIL_ADDRESS = 'test@test.com'
const REFERENCE = '1234567'
const ELIGIBILITY_ID = 4321
const CLAIM_ID = 1234

let stubSendNotification
let stubGetApprovedClaimExpenseData
let stubGetApprovedClaimDetailsString
let stubGetEnabledClaimDeductions

const BANK_DATA_PAST = { VisitorFirstName: 'Joe', AccountNumberLastFourDigits: '1234', PaymentMethod: paymentMethodEnum.DIRECT_BANK_PAYMENT.value, IsAdvanceClaim: false }
const PAYOUT_DATA_PAST = { VisitorFirstName: 'Joe', PaymentMethod: paymentMethodEnum.PAYOUT.value, Town: 'Town', Prison: prisonsEnum.HEWELL.value, IsAdvanceClaim: false }
const BANK_DATA_ADVANCE = { VisitorFirstName: 'Joe', AccountNumberLastFourDigits: '1234', PaymentMethod: paymentMethodEnum.DIRECT_BANK_PAYMENT.value, IsAdvanceClaim: true }
const PAYOUT_DATA_ADVANCE = { VisitorFirstName: 'Joe', PaymentMethod: paymentMethodEnum.PAYOUT.value, Town: 'Town', Prison: prisonsEnum.HEWELL.value, IsAdvanceClaim: true }

let sendAcceptedClaimNotification

jest.mock('../notify/send-notification', () => stubSendNotification)

jest.mock(
  '../data/get-approved-claim-expense-data',
  () => stubGetApprovedClaimExpenseData
)

jest.mock(
  '../notify/helpers/get-approved-claim-details-string',
  () => stubGetApprovedClaimDetailsString
)

jest.mock(
  '../data/get-enabled-claim-deductions',
  () => stubGetEnabledClaimDeductions
)

describe('services/send-accepted-claim-notification', function () {
  beforeEach(function () {
    stubSendNotification = jest.fn().mockResolvedValue()
    stubGetApprovedClaimExpenseData = jest.fn()
    stubGetApprovedClaimDetailsString = jest.fn().mockReturnValue('string with payment breakdown')
    stubGetEnabledClaimDeductions = jest.fn().mockResolvedValue([])

    sendAcceptedClaimNotification = require('../../../../app/services/workers/send-accepted-claim-notification')
  })

  it('should call send-notification with correct details for retro bank payment', function () {
    stubGetApprovedClaimExpenseData.mockResolvedValue({ claimantData: BANK_DATA_PAST, claimExpenseData: [{ ClaimExpenseId: 1 }] })
    return sendAcceptedClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      additionalData: EMAIL_ADDRESS,
      claimId: CLAIM_ID
    })
      .then(function () {
        expect(stubSendNotification.calledOnce).toBe(true) //eslint-disable-line
        expect(stubSendNotification.firstCall.args[0]).toBe(config.NOTIFY_ACCEPTED_CLAIM_BANK_EMAIL_TEMPLATE_ID)
        expect(stubSendNotification.firstCall.args[1]).toBe(EMAIL_ADDRESS)
        expect(stubSendNotification.firstCall.args[2].reference).toBe(REFERENCE)
        expect(stubGetApprovedClaimExpenseData.calledOnce).toBe(true) //eslint-disable-line
        expect(stubGetApprovedClaimDetailsString.calledOnce).toBe(true) //eslint-disable-line
        expect(stubGetEnabledClaimDeductions.calledOnce).toBe(true) //eslint-disable-line
      })
  })

  it('should call send-notification with correct details for advance bank payment', function () {
    stubGetApprovedClaimExpenseData.mockResolvedValue({ claimantData: BANK_DATA_ADVANCE, claimExpenseData: [{ ClaimExpenseId: 1 }] })
    return sendAcceptedClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      additionalData: EMAIL_ADDRESS,
      claimId: CLAIM_ID
    })
      .then(function () {
        expect(stubSendNotification.calledOnce).toBe(true) //eslint-disable-line
        expect(stubSendNotification.firstCall.args[0]).toBe(config.NOTIFY_ACCEPTED_CLAIM_ADVANCE_BANK_EMAIL_TEMPLATE_ID)
        expect(stubSendNotification.firstCall.args[1]).toBe(EMAIL_ADDRESS)
        expect(stubSendNotification.firstCall.args[2].reference).toBe(REFERENCE)
        expect(stubGetApprovedClaimExpenseData.calledOnce).toBe(true) //eslint-disable-line
        expect(stubGetApprovedClaimDetailsString.calledOnce).toBe(false) //eslint-disable-line
        expect(stubGetEnabledClaimDeductions.calledOnce).toBe(true) //eslint-disable-line
      })
  })

  it('should call send-notification with correct details for retro payout payment', function () {
    stubGetApprovedClaimExpenseData.mockResolvedValue({ claimantData: PAYOUT_DATA_PAST, claimExpenseData: [{ ClaimExpenseId: 1 }] })
    return sendAcceptedClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      additionalData: EMAIL_ADDRESS,
      claimId: CLAIM_ID
    })
      .then(function () {
        expect(stubSendNotification.calledOnce).toBe(true) //eslint-disable-line
        expect(stubSendNotification.firstCall.args[0]).toBe(config.NOTIFY_ACCEPTED_CLAIM_PAYOUT_EMAIL_TEMPLATE_ID)
        expect(stubSendNotification.firstCall.args[1]).toBe(EMAIL_ADDRESS)
        expect(stubSendNotification.firstCall.args[2].reference).toBe(REFERENCE)
        expect(stubGetApprovedClaimExpenseData.calledOnce).toBe(true) //eslint-disable-line
        expect(stubGetApprovedClaimDetailsString.calledOnce).toBe(true) //eslint-disable-line
        expect(stubGetEnabledClaimDeductions.calledOnce).toBe(true) //eslint-disable-line
      })
  })

  it('should call send-notification with correct details for advance payout payment', function () {
    stubGetApprovedClaimExpenseData.mockResolvedValue({ claimantData: PAYOUT_DATA_ADVANCE, claimExpenseData: [{ ClaimExpenseId: 1 }] })
    return sendAcceptedClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      additionalData: EMAIL_ADDRESS,
      claimId: CLAIM_ID
    })
      .then(function () {
        expect(stubSendNotification.calledOnce).toBe(true) //eslint-disable-line
        expect(stubSendNotification.firstCall.args[0]).toBe(config.NOTIFY_ACCEPTED_CLAIM_ADVANCE_PAYOUT_EMAIL_TEMPLATE_ID)
        expect(stubSendNotification.firstCall.args[1]).toBe(EMAIL_ADDRESS)
        expect(stubSendNotification.firstCall.args[2].reference).toBe(REFERENCE)
        expect(stubGetApprovedClaimExpenseData.calledOnce).toBe(true) //eslint-disable-line
        expect(stubGetApprovedClaimDetailsString.calledOnce).toBe(false) //eslint-disable-line
        expect(stubGetEnabledClaimDeductions.calledOnce).toBe(true) //eslint-disable-line
      })
  })

  it('should reject if there is no payment method', function () {
    stubGetApprovedClaimExpenseData.mockResolvedValue({ claimantData: {}, claimExpenseData: [] })
    return sendAcceptedClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      additionalData: EMAIL_ADDRESS,
      claimId: CLAIM_ID
    })
      .catch(function (error) {
        expect(error.message).toBe('No payment method found')
        expect(stubSendNotification.calledOnce).toBe(false) //eslint-disable-line
      })
  })
})
