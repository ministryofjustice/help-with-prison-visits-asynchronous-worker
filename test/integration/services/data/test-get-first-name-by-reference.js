const expect = require('chai').expect
const getFirstNameByReference = require('../../../../app/services/data/get-first-name-by-reference')
const testHelper = require('../../../test-helper')

const REFERENCE = 'ASDFL1'

describe('services/data/get-first-name-by-reference', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
  })

  it('should get the firstname when given the reference number', function () {
    return getFirstNameByReference('IntSchema', REFERENCE)
      .then(function (result) {
        expect(result.FirstName).to.equal('Joe')
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
