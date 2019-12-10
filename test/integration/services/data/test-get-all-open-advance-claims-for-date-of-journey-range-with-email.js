const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')
const Promise = require('bluebird')

const getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail = require('../../../../app/services/data/get-all-open-advance-claims-for-date-of-journey-range-with-email')

const REFERENCE = 'OPENADV'
const START_DATE = new Date('1930-12-08')
const END_DATE = new Date('1930-12-08 23:59')

var claimId
var eligibilityId

describe('services/data/get-all-open-advance-claims-for-date-of-journey-range-with-email', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
        eligibilityId = ids.eligibilityId
        var claim1DateOfJourney = new Date('1930-12-08 10:00')

        return knex('IntSchema.Claim')
          .update({'DateOfJourney': claim1DateOfJourney, 'IsAdvanceClaim': true, 'Status': 'APPROVED'})
          .where('ClaimId', claimId)
          .then(function () {
            var claim2 = testHelper.getClaimData(REFERENCE).Claim
            claim2.EligibilityId = eligibilityId
            claim2.ClaimId = claimId + 1
            claim2.DateOfJourney = new Date('1930-12-08 23:00')
            claim2.IsAdvanceClaim = true
            claim2.Status = 'APPROVED'

            var claim3 = testHelper.getClaimData(REFERENCE).Claim
            claim3.EligibilityId = eligibilityId
            claim3.ClaimId = claimId + 2
            claim3.DateOfJourney = new Date('1930-12-07 20:00')
            claim3.IsAdvanceClaim = true
            claim3.Status = 'APPROVED'

            return Promise.all([knex('IntSchema.Claim').insert(claim2), knex('IntSchema.Claim').insert(claim3)])
          })
      })
  })

  it('should return open advanced claims for the date of journey range', function () {
    console.log(START_DATE, END_DATE)
    return getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail(START_DATE, END_DATE)
      .then(function (claims) {
        expect(claims.length).to.equal(2)
        expect(claims[0].EmailAddress).to.be.equal('test@test.com')
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
