const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const insertClaimEvent = require('../../../../app/services/data/insert-claim-event')
const testHelper = require('../../../test-helper')

const REFERENCE = 'EVENT458'
const event = 'TEST'

var claimId
var eligibilityId

describe('services/data/insert-claim-event', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
        eligibilityId = ids.eligibilityId
      })
  })
  it('should create a Claim Event', function () {
    return insertClaimEvent(REFERENCE, eligibilityId, claimId, event, null, null, true)
      .then(function () {
        return knex.table('IntSchema.ClaimEvent')
          .where({'Reference': REFERENCE, 'EligibilityId': eligibilityId, 'ClaimId': claimId})
          .first()
          .then(function (result) {
            expect(result.Event).to.be.equal(event)
            expect(result.IsInternal).to.be.true
            expect(result.DateSubmitted).not.to.be.null
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
