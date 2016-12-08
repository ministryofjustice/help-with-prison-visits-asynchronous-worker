const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')
const statusEnum = require('../../../../app/constants/status-enum')

const updateClaimStatusIfAllDocumentsSupplied = require('../../../../app/services/data/update-claim-status-if-all-documents-supplied')

const REFERENCE = 'UPCLMSD'
var eligibilityId
var claimId

describe('services/data/update-claim-status-if-all-documents-supplied', function () {
  beforeEach(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        eligibilityId = ids.eligibilityId
        claimId = ids.claimId
      })
  })

  it('should update Claim Status to NEW', function () {
    return knex('IntSchema.Claim').where('ClaimId', claimId).update({'Status': statusEnum.PENDING})
      .then(function () { return updateClaimStatusIfAllDocumentsSupplied(REFERENCE, eligibilityId, claimId) })
      .then(function () {
        return knex('IntSchema.Claim').where('ClaimId', claimId).first()
          .then(function (claim) {
            expect(claim.Status).to.be.equal(statusEnum.NEW)
          })
      })
  })

  it('should update Claim Status to PENDING', function () {
    return knex('IntSchema.ClaimDocument').where('ClaimId', claimId).update({'DocumentStatus': 'post-later'})
      .then(function () { return updateClaimStatusIfAllDocumentsSupplied(REFERENCE, eligibilityId, claimId) })
      .then(function () {
        return knex('IntSchema.Claim').where('ClaimId', claimId).first()
          .then(function (claim) {
            expect(claim.Status).to.be.equal(statusEnum.PENDING)
          })
      })
  })

  afterEach(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
