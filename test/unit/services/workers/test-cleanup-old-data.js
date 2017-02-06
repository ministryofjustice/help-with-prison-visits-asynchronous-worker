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

const OLD_CLAIM_DATA = [
  {
    ClaimId: 3
  },
  {
    ClaimId: 4
  }
]

var getOldEligibilityDataStub
var getOldClaimDataStub
var deleteClaimFromExternalStub
var deleteOldFilesStub

var cleanupOldData

describe('services/workers/cleanup-old-data', function () {
  beforeEach(function () {
    getOldEligibilityDataStub = sinon.stub()
    getOldClaimDataStub = sinon.stub()
    deleteClaimFromExternalStub = sinon.stub().resolves()
    deleteOldFilesStub = sinon.stub().resolves()

    cleanupOldData = proxyquire('../../../../app/services/workers/cleanup-old-data', {
      '../data/get-old-eligibility-data': getOldEligibilityDataStub,
      '../data/get-old-claim-data': getOldClaimDataStub,
      '../data/delete-claim-from-external': deleteClaimFromExternalStub,
      '../cleanup-old-data/delete-old-files': deleteOldFilesStub
    })
  })

  it('should retrieve any old eligibility records and delete them from the external database', function () {
    getOldEligibilityDataStub.resolves(OLD_ELIGIBILITY_DATA)
    getOldClaimDataStub.resolves([])

    return cleanupOldData.execute({}).then(function () {
      expect(getOldEligibilityDataStub.calledOnce).to.be.true
      expect(getOldClaimDataStub.calledOnce).to.be.true
      expect(deleteOldFilesStub.calledTwice).to.be.true
      expect(deleteClaimFromExternalStub.calledWith(OLD_ELIGIBILITY_DATA[0].EligibilityId, OLD_ELIGIBILITY_DATA[0].ClaimId)).to.be.true
      expect(deleteClaimFromExternalStub.calledWith(OLD_ELIGIBILITY_DATA[1].EligibilityId, OLD_ELIGIBILITY_DATA[1].ClaimId)).to.be.true
    })
  })

  it('should retrieve any old claim records and delete them from the external database', function () {
    getOldEligibilityDataStub.resolves([])
    getOldClaimDataStub.resolves(OLD_CLAIM_DATA)

    return cleanupOldData.execute({}).then(function () {
      expect(getOldEligibilityDataStub.calledOnce).to.be.true
      expect(getOldClaimDataStub.calledOnce).to.be.true
      expect(deleteOldFilesStub.calledTwice).to.be.true
      expect(deleteClaimFromExternalStub.calledWith(OLD_CLAIM_DATA[0].EligibilityId, OLD_CLAIM_DATA[0].ClaimId)).to.be.true
      expect(deleteClaimFromExternalStub.calledWith(OLD_CLAIM_DATA[1].EligibilityId, OLD_CLAIM_DATA[1].ClaimId)).to.be.true
    })
  })
})
