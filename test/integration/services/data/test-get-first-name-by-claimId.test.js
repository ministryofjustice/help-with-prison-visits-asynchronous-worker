const getFirstNameByClaimId = require('../../../../app/services/data/get-first-name-by-claimId')
const testHelper = require('../../../test-helper')

const REFERENCE = '1STNAME'

let claimId

describe('services/data/get-first-name-by-claimId', () => {
  beforeAll(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, 'NEW').then(claimData => {
      claimId = claimData.claimId
    })
  })

  it('should get the firstname when given the claim id', () => {
    return getFirstNameByClaimId('IntSchema', claimId).then(firstName => {
      expect(firstName).toBe('Joe')
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
