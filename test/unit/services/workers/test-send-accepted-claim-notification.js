const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')
const paymentMethodEnum = require('../../../../app/constants/payment-method-enum')
const prisonsEnum = require('../../../../app/constants/prisons-enum')

const config = require('../../../../config')

const EMAIL_ADDRESS = 'test@test.com'
const REFERENCE = '1234567'
const ELIGIBILITY_ID = 4321
const CLAIM_ID = 1234

var stubSendNotification
var stubGetApprovedClaimExpenseData
var stubGetApprovedClaimDetailsString
var stubGetEnabledClaimDeductions

const BANK_DATA_PAST = {'VisitorFirstName': 'Joe', 'AccountNumberLastFourDigits': '1234', 'PaymentMethod': paymentMethodEnum.DIRECT_BANK_PAYMENT.value, 'IsAdvanceClaim': false}
const PAYOUT_DATA_PAST = {'VisitorFirstName': 'Joe', 'PaymentMethod': paymentMethodEnum.PAYOUT.value, 'Town': 'Town', 'Prison': prisonsEnum.HEWELL.value, 'IsAdvanceClaim': false}
const BANK_DATA_ADVANCE = {'VisitorFirstName': 'Joe', 'AccountNumberLastFourDigits': '1234', 'PaymentMethod': paymentMethodEnum.DIRECT_BANK_PAYMENT.value, 'IsAdvanceClaim': true}
const PAYOUT_DATA_ADVANCE = {'VisitorFirstName': 'Joe', 'PaymentMethod': paymentMethodEnum.PAYOUT.value, 'Town': 'Town', 'Prison': prisonsEnum.HEWELL.value, 'IsAdvanceClaim': true}

var sendAcceptedClaimNotification

describe('services/send-accepted-claim-notification', function () {
  beforeEach(function () {
    stubSendNotification = sinon.stub().resolves()
    stubGetApprovedClaimExpenseData = sinon.stub()
    stubGetApprovedClaimDetailsString = sinon.stub().returns('string with payment breakdown')
    stubGetEnabledClaimDeductions = sinon.stub().resolves([])

    sendAcceptedClaimNotification = proxyquire('../../../../app/services/workers/send-accepted-claim-notification', {
      '../notify/send-notification': stubSendNotification,
      '../data/get-approved-claim-expense-data': stubGetApprovedClaimExpenseData,
      '../notify/helpers/get-approved-claim-details-string': stubGetApprovedClaimDetailsString,
      '../data/get-enabled-claim-deductions': stubGetEnabledClaimDeductions
    })
  })

  it('should call send-notification with correct details for retro bank payment', function () {
    stubGetApprovedClaimExpenseData.resolves({claimantData: BANK_DATA_PAST, claimExpenseData: [{ClaimExpenseId: 1}]})
    return sendAcceptedClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      additionalData: EMAIL_ADDRESS,
      claimId: CLAIM_ID
    })
    .then(function () {
      expect(stubSendNotification.calledOnce).to.be.true
      expect(stubSendNotification.firstCall.args[0]).to.be.equal(config.NOTIFY_ACCEPTED_CLAIM_EMAIL_TEMPLATE_ID)
      expect(stubSendNotification.firstCall.args[1]).to.be.equal(EMAIL_ADDRESS)
      expect(stubSendNotification.firstCall.args[2].reference).to.be.equal(REFERENCE)
      expect(stubGetApprovedClaimExpenseData.calledOnce).to.be.true
      expect(stubGetApprovedClaimDetailsString.calledOnce).to.be.true
      expect(stubGetEnabledClaimDeductions.calledOnce).to.be.true
    })
  })

  it('should call send-notification with correct details for advance bank payment', function () {
    stubGetApprovedClaimExpenseData.resolves({claimantData: BANK_DATA_ADVANCE, claimExpenseData: [{ClaimExpenseId: 1}]})
    return sendAcceptedClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      additionalData: EMAIL_ADDRESS,
      claimId: CLAIM_ID
    })
    .then(function () {
      expect(stubSendNotification.calledOnce).to.be.true
      expect(stubSendNotification.firstCall.args[0]).to.be.equal(config.NOTIFY_ACCEPTED_CLAIM_ADVANCE_BANK_EMAIL_TEMPLATE_ID)
      expect(stubSendNotification.firstCall.args[1]).to.be.equal(EMAIL_ADDRESS)
      expect(stubSendNotification.firstCall.args[2].reference).to.be.equal(REFERENCE)
      expect(stubGetApprovedClaimExpenseData.calledOnce).to.be.true
      expect(stubGetApprovedClaimDetailsString.calledOnce).to.be.false
      expect(stubGetEnabledClaimDeductions.calledOnce).to.be.true
    })
  })

  it('should call send-notification with correct details for retro payout payment', function () {
    stubGetApprovedClaimExpenseData.resolves({claimantData: PAYOUT_DATA_PAST, claimExpenseData: [{ClaimExpenseId: 1}]})
    return sendAcceptedClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      additionalData: EMAIL_ADDRESS,
      claimId: CLAIM_ID
    })
    .then(function () {
      expect(stubSendNotification.calledOnce).to.be.true
      expect(stubSendNotification.firstCall.args[0]).to.be.equal(config.NOTIFY_ACCEPTED_CLAIM_PAYOUT_EMAIL_TEMPLATE_ID)
      expect(stubSendNotification.firstCall.args[1]).to.be.equal(EMAIL_ADDRESS)
      expect(stubSendNotification.firstCall.args[2].reference).to.be.equal(REFERENCE)
      expect(stubGetApprovedClaimExpenseData.calledOnce).to.be.true
      expect(stubGetApprovedClaimDetailsString.calledOnce).to.be.true
      expect(stubGetEnabledClaimDeductions.calledOnce).to.be.true
    })
  })

  it('should call send-notification with correct details for advance payout payment', function () {
    stubGetApprovedClaimExpenseData.resolves({claimantData: PAYOUT_DATA_ADVANCE, claimExpenseData: [{ClaimExpenseId: 1}]})
    return sendAcceptedClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      additionalData: EMAIL_ADDRESS,
      claimId: CLAIM_ID
    })
    .then(function () {
      expect(stubSendNotification.calledOnce).to.be.true
      expect(stubSendNotification.firstCall.args[0]).to.be.equal(config.NOTIFY_ACCEPTED_CLAIM_ADVANCE_PAYOUT_EMAIL_TEMPLATE_ID)
      expect(stubSendNotification.firstCall.args[1]).to.be.equal(EMAIL_ADDRESS)
      expect(stubSendNotification.firstCall.args[2].reference).to.be.equal(REFERENCE)
      expect(stubGetApprovedClaimExpenseData.calledOnce).to.be.true
      expect(stubGetApprovedClaimDetailsString.calledOnce).to.be.false
      expect(stubGetEnabledClaimDeductions.calledOnce).to.be.true
    })
  })

  it('should reject if there is no payment method', function () {
    stubGetApprovedClaimExpenseData.resolves({claimantData: {}, claimExpenseData: []})
    return sendAcceptedClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      additionalData: EMAIL_ADDRESS,
      claimId: CLAIM_ID
    })
    .catch(function (error) {
      expect(error).to.equal('No payment method found')
      expect(stubSendNotification.calledOnce).to.be.false
    })
  })
})
