const testHelper = require('../../../test-helper')

const getLastSetNumberOfClaimsStatus = require('../../../../app/services/data/get-last-set-number-of-claims-status')

const REFERENCE = 'GETSTAT'
const NUMBER_OF_CLAIMS = 4
const STATUS_RETURN = 'TEST_RETURNED'
const STATUS_NOT_RETURN = 'TEST_NOT_RETURNED'
const STATUS_CURRENT_CLAIM = 'CURRENT_CLAIM'

let claimId

describe('services/data/get-last-set-number-of-claims-status', function () {
  beforeAll(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, STATUS_NOT_RETURN, true).then(function () {
      return Promise.all([
        testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, STATUS_RETURN, true),
        testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, STATUS_RETURN, true),
        testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, STATUS_RETURN, true),
        testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, STATUS_RETURN, true),
        testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, STATUS_CURRENT_CLAIM, true).then(function (ids) {
          claimId = ids.claimId
        }),
      ])
    })
  })

  it('should retrieve claim document records past the date threshold', function () {
    return getLastSetNumberOfClaimsStatus(REFERENCE, claimId, NUMBER_OF_CLAIMS).then(function (results) {
      expect(results.length).toBe(4)
      expect(results[0].Status).toBe(STATUS_RETURN)
      expect(results[1].Status).toBe(STATUS_RETURN)
      expect(results[2].Status).toBe(STATUS_RETURN)
      expect(results[3].Status).toBe(STATUS_RETURN)
    })
  })

  afterAll(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
