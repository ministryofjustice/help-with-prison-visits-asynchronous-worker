const getFirstNameByClaimId = require('../../../../app/services/data/get-first-name-by-claimId')
const testHelper = require('../../../test-helper')

const REFERENCE = '1STNAME'

let claimId

describe('services/data/get-first-name-by-claimId', function () {
  beforeAll(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, 'NEW')
      .then(function (claimData) {
        claimId = claimData.claimId
      })
  })

  it('should get the firstname when given the claim id', function () {
    return getFirstNameByClaimId('IntSchema', claimId)
      .then(function (firstName) {
        expect(firstName).toBe('Joe')
      })
  })

  afterAll(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
