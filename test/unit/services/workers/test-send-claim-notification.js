const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const config = require('../../../../config')

const EMAIL_ADDRESS = 'test@test.com'
const REFERENCE = '1234567'
const ELIGIBILITY_ID = 4321
const FIRST_NAME = 'Joe'

var stubSendNotification = sinon.stub().resolves()
var stubGetFirstNameByClaimId = sinon.stub().resolves({
  'FirstName': FIRST_NAME
})

const sendClaimNotification = proxyquire('../../../../app/services/workers/send-claim-notification', {
  '../notify/send-notification': stubSendNotification,
  '../data/get-first-name-by-claimId': stubGetFirstNameByClaimId
})

describe('services/send-claim-notification', function () {
  it('should call send-notification with correct details', function () {
    return sendClaimNotification.execute({
      reference: REFERENCE,
      eligibilityId: ELIGIBILITY_ID,
      additionalData: EMAIL_ADDRESS
    })
    .then(function () {
      expect(stubSendNotification.called).to.be.true
      expect(stubSendNotification.firstCall.args[0]).to.be.equal(config.NOTIFY_SUBMIT_CLAIM_EMAIL_TEMPLATE_ID)
      expect(stubSendNotification.firstCall.args[1]).to.be.equal(EMAIL_ADDRESS)
      expect(stubSendNotification.firstCall.args[2].reference).to.be.equal(REFERENCE)
      expect(stubSendNotification.firstCall.args[2].first_name).to.be.equal(FIRST_NAME)
      expect(stubSendNotification.firstCall.args[2].requestInfoUrl).not.to.be.null
    })
  })
})
