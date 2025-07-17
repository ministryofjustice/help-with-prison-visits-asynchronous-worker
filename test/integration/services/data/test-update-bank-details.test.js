const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const updateBankDetails = require('../../../../app/services/data/update-bank-details')
const testHelper = require('../../../test-helper')

const reference = 'NEWBANK'
let claimId
let claimBankDetailId
const sortcode = '123456'
const accountNumber = '12345678'

describe('services/data/update-bank-details', () => {
  beforeAll(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', reference).then(ids => {
      claimId = ids.claimId
      claimBankDetailId = ids.claimBankDetailId
    })
  })

  it('should update bank details with new sortcode and acoount number', () => {
    return updateBankDetails(claimBankDetailId, reference, claimId, sortcode, accountNumber).then(() => {
      const db = getDatabaseConnector()

      return db
        .table('IntSchema.ClaimBankDetail')
        .where({ ClaimBankDetailId: claimBankDetailId, Reference: reference, ClaimId: claimId })
        .first()
        .then(result => {
          expect(result.SortCode).toBe(sortcode)
          expect(result.AccountNumber).toBe(accountNumber)
        })
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
