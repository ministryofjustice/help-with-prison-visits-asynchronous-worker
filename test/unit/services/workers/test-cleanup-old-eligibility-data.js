const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const OLD_ELIGIBILITY_DATA = [
  {
    EligibilityId: 1,
    ClaimId: 1
  },
  {
    EligibilityId: 2,
    ClaimId: 2
  }
]

const getOldEligibilityDataStub = sinon.stub().resolves(OLD_ELIGIBILITY_DATA)
const deleteClaimFromExternalStub = sinon.stub().resolves()

const cleanupOldEligibilityData = proxyquire('../../../../app/services/workers/cleanup-old-eligibility-data', {
  '../data/get-old-eligibility-data': getOldEligibilityDataStub,
  '../data/delete-claim-from-external': deleteClaimFromExternalStub
})

describe('services/workers/cleanup-old-eligibility-data', function () {
  it('should retrieve any old eligibility records and delete them from the external database', function () {
    return cleanupOldEligibilityData.execute({}).then(function () {
      expect(getOldEligibilityDataStub.calledOnce).to.be.true
      expect(deleteClaimFromExternalStub.calledWith(OLD_ELIGIBILITY_DATA[0].EligibilityId, OLD_ELIGIBILITY_DATA[0].ClaimId)).to.be.true
      expect(deleteClaimFromExternalStub.calledWith(OLD_ELIGIBILITY_DATA[1].EligibilityId, OLD_ELIGIBILITY_DATA[1].ClaimId)).to.be.true
    })
  })
})
