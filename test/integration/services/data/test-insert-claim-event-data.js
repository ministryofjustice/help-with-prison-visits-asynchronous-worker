const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const insertClaimEvent = require('../../../../app/services/data/insert-claim-event-data')
const testHelper = require('../../../test-helper')

const reference = 'EVENT458'
const event = 'TEST'

var claim = {Reference: reference}

describe('services/data/insert-claim-event-data', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function (ids) {
        claim.ClaimId = ids.claimId
        claim.EligibilityId = ids.eligibilityId
      })
  })
  it('should create a Claim Event', function () {
    return insertClaimEvent(claim, event, null, null, true)
      .then(function () {
        return knex.table('IntSchema.ClaimEvent')
          .where({'Reference': reference, 'EligibilityId': claim.EligibilityId, 'ClaimId': claim.ClaimId})
          .first()
          .then(function (result) {
            expect(result.Event).to.be.equal(event)
            expect(result.IsInternal).to.be.true
            expect(result.DateSubmitted).not.to.be.null
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
