const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')


const reminderEnum = require('../../../../app/constants/advance-claim-reminder-enum')
const config = require('../../../../config')

const EMAIL_ADDRESS = 'test@test.com'
const REFERENCE = '1234567'
const ELIGIBILITY_ID = 4321
const CLAIM_ID = 1234
const FIRST_NAME = 'Joe'

const dateOfJourney = new Date('2016-02-01')
const dateOfJourneyString = '1 February 2016'

var stubGetClaim
var stubSendNotification
var stubGetFirstNameByClaimId

var sendRequestInformationClaimNotification

describe('services/send-advance-claim-evidence-reminder-notification', function () {
  beforeEach(function () {
    stubGetClaim = sinon.stub().resolves({ DateOfJourney: dateOfJourney })
    stubSendNotification = sinon.stub().resolves()
    stubGetFirstNameByClaimId = sinon.stub().resolves(FIRST_NAME)

    sendRequestInformationClaimNotification = proxyquire('../../../../app/services/workers/send-advance-claim-evidence-reminder-notification', {
      '../data/get-claim': stubGetClaim,
      '../data/get-first-name-by-claimId': stubGetFirstNameByClaimId,
      '../notify/send-notification': stubSendNotification
    })
  })

  it('should call send-notification with correct details for first reminder', function () {
    return sendRequestInformationClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      claimId: CLAIM_ID,
      additionalData: `${EMAIL_ADDRESS}~~${reminderEnum.FIRST}`
    })
      .then(function () {
        expect(stubGetClaim.calledWith('IntSchema', CLAIM_ID)).to.be.true //eslint-disable-line
        expect(stubSendNotification.called).to.be.true //eslint-disable-line
        expect(stubSendNotification.firstCall.args[0]).to.be.equal(config.NOTIFY_ADVANCE_CLAIM_EVIDENCE_REMINDER_TEMPLATE_ID)
        expect(stubSendNotification.firstCall.args[1]).to.be.equal(EMAIL_ADDRESS)
        expect(stubSendNotification.firstCall.args[2].reference).to.be.equal(REFERENCE)
        expect(stubSendNotification.firstCall.args[2].dateOfJourney).to.be.equal(dateOfJourneyString)
        expect(stubSendNotification.firstCall.args[2].requestInfoUrl).not.to.be.null //eslint-disable-line
        expect(stubSendNotification.firstCall.args[2].first_name).to.be.equal(FIRST_NAME)
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
        expect(stubGetClaim.calledWith('IntSchema', CLAIM_ID)).to.be.true //eslint-disable-line
        expect(stubSendNotification.called).to.be.true //eslint-disable-line
        expect(stubSendNotification.firstCall.args[0]).to.be.equal(config.NOTIFY_ADVANCE_CLAIM_SECOND_EVIDENCE_REMINDER_TEMPLATE_ID)
        expect(stubSendNotification.firstCall.args[1]).to.be.equal(EMAIL_ADDRESS)
        expect(stubSendNotification.firstCall.args[2].reference).to.be.equal(REFERENCE)
        expect(stubSendNotification.firstCall.args[2].dateOfJourney).to.be.equal(dateOfJourneyString)
        expect(stubSendNotification.firstCall.args[2].requestInfoUrl).not.to.be.null //eslint-disable-line
        expect(stubSendNotification.firstCall.args[2].first_name).to.be.equal(FIRST_NAME)
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
        expect(error.message).to.equal('Not valid reminder type')
        expect(stubSendNotification.calledOnce).to.be.false //eslint-disable-line
      })
  })
})
