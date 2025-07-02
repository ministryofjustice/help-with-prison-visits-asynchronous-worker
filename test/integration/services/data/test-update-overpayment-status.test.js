const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const updateOverpaymentStatus = require('../../../../app/services/data/update-overpayment-status')

const AMOUNT = 100
const REFERENCE = 'OVERPAY'
let claimId

describe('services/data/update-overpayment-status', () => {
  beforeEach(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE).then(ids => {
      claimId = ids.claimId
    })
  })

  it('should update Claim IsOverpaid to true and with the amount added', () => {
    return updateOverpaymentStatus(claimId, REFERENCE, AMOUNT, '10').then(() => {
      const db = getDatabaseConnector()

      return db('IntSchema.Claim')
        .where('ClaimId', claimId)
        .first()
        .then(claim => {
          expect(claim.IsOverpaid).toBe(true)
          expect(claim.OverpaymentAmount).toBe(AMOUNT)
          expect(claim.RemainingOverpaymentAmount).toBe(AMOUNT)
          expect(claim.OverpaymentReason).toBe('Evidence not uploaded within 10 days')
        })
    })
  })

  afterEach(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
