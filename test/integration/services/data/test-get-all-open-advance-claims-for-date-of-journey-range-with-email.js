const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail = require('../../../../app/services/data/get-all-open-advance-claims-for-date-of-journey-range-with-email')

const REFERENCE = 'OPENADV'
const START_DATE = new Date('1930-12-08')
const END_DATE = new Date('1930-12-08 23:59')

let claimId
let eligibilityId

describe('services/data/get-all-open-advance-claims-for-date-of-journey-range-with-email', function () {
  beforeAll(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
        eligibilityId = ids.eligibilityId
        const claim1DateOfJourney = new Date('1930-12-08 10:00')
        const db = getDatabaseConnector()

        return db('IntSchema.Claim')
          .update({ DateOfJourney: claim1DateOfJourney, IsAdvanceClaim: true, Status: 'APPROVED' })
          .where('ClaimId', claimId)
          .then(function () {
            const claim2 = testHelper.getClaimData(REFERENCE).Claim
            claim2.EligibilityId = eligibilityId
            claim2.ClaimId = claimId + 1
            claim2.DateOfJourney = new Date('1930-12-08 23:00')
            claim2.IsAdvanceClaim = true
            claim2.Status = 'APPROVED'

            const claim3 = testHelper.getClaimData(REFERENCE).Claim
            claim3.EligibilityId = eligibilityId
            claim3.ClaimId = claimId + 2
            claim3.DateOfJourney = new Date('1930-12-07 20:00')
            claim3.IsAdvanceClaim = true
            claim3.Status = 'APPROVED'

            return Promise.all([db('IntSchema.Claim').insert(claim2), db('IntSchema.Claim').insert(claim3)])
          })
      })
  })

  it('should return open advanced claims for the date of journey range', function () {
    console.log(START_DATE, END_DATE)
    return getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail(START_DATE, END_DATE)
      .then(function (claims) {
        expect(claims.length).toBe(2)
        expect(claims[0].EmailAddress).toBe('test@test.com')
      })
  })

  afterAll(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
