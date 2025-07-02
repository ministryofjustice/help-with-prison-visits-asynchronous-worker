const getClaim = require('../../../../app/services/data/get-claim')
const testHelper = require('../../../test-helper')

const REFERENCE = 'GETCLM1'
let claimId

describe('services/data/get-claim', () => {
  beforeAll(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE).then(ids => {
      claimId = ids.claimId
    })
  })

  it('should get the claim', () => {
    return getClaim('IntSchema', claimId).then(claim => {
      expect(claim.Reference).toBe(REFERENCE)
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
