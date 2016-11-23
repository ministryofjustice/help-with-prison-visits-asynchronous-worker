const expect = require('chai').expect
const testHelper = require('../../../test-helper')

const getDataForAutoApprovalCheck = require('../../../../app/services/data/get-data-for-auto-approval-check')
var reference = 'AUTOAPP'
var eligibilityId
var claimId

describe('services/data/get-data-for-auto-approval-check', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference).then(function (ids) {
      eligibilityId = ids.eligibilityId
      claimId = ids.claimId
    })
  })
// TODO the rest of this test
  it('should do stuff', function () {
    return getDataForAutoApprovalCheck(claimId, eligibilityId)
    .then(function (result) {
      expect(result.claim).to.not.be.null
      expect(result.claimExpenses).to.not.be.null
      expect(result.claimDocuments).to.not.be.null
      expect(result.claimChildren).to.not.be.null
      expect(result.prisoner).to.not.be.null
    })
  })

  after(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
