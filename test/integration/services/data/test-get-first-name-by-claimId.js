const expect = require('chai').expect
const getFirstNameByReference = require('../../../../app/services/data/get-first-name-by-claimId')
const testHelper = require('../../../test-helper')

const REFERENCE = '1STNAME'

var claimId

describe('services/data/get-first-name-by-claimId', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, 'NEW')
      .then(function (claimData) {
        claimId = claimData.claimId
      })
  })

  it('should get the firstname when given the claim id', function () {
    return getFirstNameByReference('IntSchema', claimId)
      .then(function (result) {
        expect(result[0].FirstName).to.equal('Joe')
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
