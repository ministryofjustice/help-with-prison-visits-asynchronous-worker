const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')

const updateClaimStatus = require('../../../../app/services/data/update-claim-status')

const STATUS = 'TEST'
const REFERENCE = 'UPCLMSD'
let claimId

describe('services/data/update-claim-status', function () {
  beforeEach(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should update Claim Status to NEW', function () {
    return updateClaimStatus(claimId, STATUS)
      .then(function () {
        return knex('IntSchema.Claim').where('ClaimId', claimId).first()
          .then(function (claim) {
            expect(claim.Status).to.be.equal(STATUS)
          })
      })
  })

  afterEach(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
