const expect = require('chai').expect
const testHelper = require('../../../test-helper')

const getLastSetNumberOfClaimsStatus = require('../../../../app/services/data/get-last-set-number-of-claims-status')

const REFERENCE = 'GETSTAT'
const NUMBER_OF_CLAIMS = 4
const STATUS_RETURN = 'TEST_RETURNED'
const STATUS_NOT_RETURN = 'TEST_NOT_RETURNED'

describe('services/data/get-last-set-number-of-claims-status', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, STATUS_NOT_RETURN, true)
      .then(function () {
        return Promise.all([
          testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, STATUS_RETURN, true),
          testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, STATUS_RETURN, true),
          testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, STATUS_RETURN, true),
          testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, STATUS_RETURN, true)
        ])
      })
  })

  it('should retrieve claim document records past the date threshold', function () {
    return getLastSetNumberOfClaimsStatus(REFERENCE, NUMBER_OF_CLAIMS)
      .then(function (results) {
        expect(results.length).to.equal(4)
        expect(results[0].Status).to.equal(STATUS_RETURN)
        expect(results[1].Status).to.equal(STATUS_RETURN)
        expect(results[2].Status).to.equal(STATUS_RETURN)
        expect(results[3].Status).to.equal(STATUS_RETURN)
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
