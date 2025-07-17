const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const getNumberOfClaimsForEligibility = require('../../../../app/services/data/get-number-of-claims-for-eligibility')

const REFERENCE = 'GETNUME'

let eligibilityId

describe('services/data/get-number-of-claims-for-eligibility', () => {
  beforeAll(() => {
    const claim1 = testHelper.getClaimData(REFERENCE).Claim

    eligibilityId = claim1.EligibilityId

    const claim2 = testHelper.getClaimData(REFERENCE).Claim
    claim2.ClaimId = claim1.ClaimId + 1

    const db = getDatabaseConnector()

    return Promise.all([db('IntSchema.Claim').insert(claim1), db('IntSchema.Claim').insert(claim2)])
  })

  it('should return number of claims for an eligibility Id', () => {
    return getNumberOfClaimsForEligibility('IntSchema', eligibilityId).then(claimCount => {
      expect(claimCount).toBe(2)
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
