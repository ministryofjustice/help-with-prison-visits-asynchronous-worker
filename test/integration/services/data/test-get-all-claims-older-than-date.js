const dateFormatter = require('../../../../app/services/date-formatter')
const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')

const getAllClaimsOldersThanDate = require('../../../../app/services/data/get-all-claims-older-than-date')

const REFERENCE = 'OLDCLMS'

let claimId
let eligibilityId
let claim2
let claim3
const olderThanDate = dateFormatter.now().subtract(365, 'days').toDate()

describe('services/data/get-all-claims-older-than-date', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
        eligibilityId = ids.eligibilityId

        claim2 = testHelper.getClaimData(REFERENCE).Claim
        claim2.EligibilityId = eligibilityId
        claim2.ClaimId = claimId + 1
        claim2.DateReviewed = dateFormatter.now().subtract(366, 'days').toDate()
        claim2.Status = 'APPROVED'

        claim3 = testHelper.getClaimData(REFERENCE).Claim
        claim3.EligibilityId = eligibilityId
        claim3.ClaimId = claimId + 2
        claim3.DateReviewed = dateFormatter.now().subtract(370, 'days').toDate()
        claim3.Status = 'APPROVED'

        return Promise.all([knex('IntSchema.Claim').insert(claim2), knex('IntSchema.Claim').insert(claim3)])
      })
  })

  it('should return claims with date reviewed older than date', function () {
    return getAllClaimsOldersThanDate(olderThanDate)
      .then(function (claimIds) {
        const expectedClaimIds = claimIds.filter(function (result) { // filter to remove old test claims
          return result.ClaimId === claim2.ClaimId || result.ClaimId === claim3.ClaimId
        })

        expect(expectedClaimIds.length).to.equal(2)
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
