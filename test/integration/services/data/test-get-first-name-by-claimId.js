const expect = require('chai').expect
const getFirstNameByClaimId = require('../../../../app/services/data/get-first-name-by-claimId')
const testHelper = require('../../../test-helper')

const REFERENCE = '1STNAME'

let claimId

describe('services/data/get-first-name-by-claimId', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, 'NEW')
      .then(function (claimData) {
        claimId = claimData.claimId
      })
  })

  it('should get the firstname when given the claim id', function () {
    return getFirstNameByClaimId('IntSchema', claimId)
      .then(function (firstName) {
        expect(firstName).to.equal('Joe')
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
