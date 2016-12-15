const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const config = require('../../../../config')

const EMAIL_ADDRESS = 'test@test.com'
const REFERENCE = '1234567'
const ELIGIBILITY_ID = 4321
const CLAIM_ID = 1234

const dateOfJourney = new Date('2016-02-01')
const dateOfJourneyString = '1 February 2016'

var stubGetClaim = sinon.stub().resolves({DateOfJourney: dateOfJourney})
var stubSendNotification = sinon.stub().resolves()

const sendRequestInformationClaimNotification = proxyquire('../../../../app/services/workers/send-advance-claim-evidence-reminder-notification', {
  '../data/get-claim': stubGetClaim,
  '../notify/send-notification': stubSendNotification
})

describe('services/send-advance-claim-evidence-reminder-notification', function () {
  it('should call send-notification with correct details', function () {
    return sendRequestInformationClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      claimId: CLAIM_ID,
      additionalData: EMAIL_ADDRESS
    })
    .then(function () {
      expect(stubGetClaim.calledWith('IntSchema', CLAIM_ID)).to.be.true
      expect(stubSendNotification.called).to.be.true
      expect(stubSendNotification.firstCall.args[0]).to.be.equal(config.NOTIFY_ADVANCE_CLAIM_EVIDENCE_REMINDER_TEMPLATE_ID)
      expect(stubSendNotification.firstCall.args[1]).to.be.equal(EMAIL_ADDRESS)
      expect(stubSendNotification.firstCall.args[2].reference).to.be.equal(REFERENCE)
      expect(stubSendNotification.firstCall.args[2].dateOfJourney).to.be.equal(dateOfJourneyString)
      expect(stubSendNotification.firstCall.args[2].requestInfoUrl).not.to.be.null
    })
  })
})
