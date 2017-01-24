const moment = require('moment')
const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')
const Promise = require('bluebird')

const getAllClaimsOldersThanDate = require('../../../../app/services/data/get-all-claims-older-than-date')

const REFERENCE = 'OLDCLMS'

var claimId
var eligibilityId
var claim2
var claim3
var olderThanDate = moment().subtract(365, 'days').toDate()

describe('services/data/get-all-claims-older-than-date', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
        eligibilityId = ids.eligibilityId

        claim2 = testHelper.getClaimData(REFERENCE).Claim
        claim2.EligibilityId = eligibilityId
        claim2.ClaimId = claimId + 1
        claim2.DateReviewed = moment().subtract(366, 'days').toDate()
        claim2.Status = 'APPROVED'

        claim3 = testHelper.getClaimData(REFERENCE).Claim
        claim3.EligibilityId = eligibilityId
        claim3.ClaimId = claimId + 2
        claim3.DateReviewed = moment().subtract(370, 'days').toDate()
        claim3.Status = 'APPROVED'

        return Promise.all([knex('IntSchema.Claim').insert(claim2), knex('IntSchema.Claim').insert(claim3)])
      })
  })

  it('should return claims with date reviewed older than date', function () {
    return getAllClaimsOldersThanDate(olderThanDate)
      .then(function (claimIds) {
        expect(claimIds.length).to.equal(2)
        expect(claimIds[0].ClaimId).to.be.equal(claim2.ClaimId)
        expect(claimIds[1].ClaimId).to.be.equal(claim3.ClaimId)
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
