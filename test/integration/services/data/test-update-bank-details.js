const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const updateBankDetails = require('../../../../app/services/data/update-bank-details')
const testHelper = require('../../../test-helper')

const reference = 'NEWBANK'
var claimId
var claimBankDetailId
var sortcode = '123456'
var accountNumber = '12345678'

describe('services/data/update-bank-details', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function (ids) {
        claimId = ids.claimId
        claimBankDetailId = ids.claimBankDetailId
      })
  })

  it('should update bank details with new sortcode and acoount number', function () {
    return updateBankDetails(claimBankDetailId, reference, claimId, sortcode, accountNumber)
      .then(function () {
        return knex.table('IntSchema.ClaimBankDetail')
          .where({'ClaimBankDetailId': claimBankDetailId, 'Reference': reference, 'ClaimId': claimId})
          .first()
          .then(function (result) {
            expect(result.SortCode).to.be.equal(sortcode)
            expect(result.AccountNumber).to.be.equal(accountNumber)
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
