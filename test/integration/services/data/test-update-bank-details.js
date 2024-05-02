const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const updateBankDetails = require('../../../../app/services/data/update-bank-details')
const testHelper = require('../../../test-helper')

const reference = 'NEWBANK'
let claimId
let claimBankDetailId
const sortcode = '123456'
const accountNumber = '12345678'

describe('services/data/update-bank-details', function () {
  beforeAll(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference).then(function (ids) {
      claimId = ids.claimId
      claimBankDetailId = ids.claimBankDetailId
    })
  })

  it('should update bank details with new sortcode and acoount number', function () {
    return updateBankDetails(claimBankDetailId, reference, claimId, sortcode, accountNumber).then(function () {
      const db = getDatabaseConnector()

      return db
        .table('IntSchema.ClaimBankDetail')
        .where({ ClaimBankDetailId: claimBankDetailId, Reference: reference, ClaimId: claimId })
        .first()
        .then(function (result) {
          expect(result.SortCode).toBe(sortcode)
          expect(result.AccountNumber).toBe(accountNumber)
        })
    })
  })

  afterAll(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
