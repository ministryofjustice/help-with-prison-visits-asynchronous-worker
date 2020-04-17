const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')


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

const OLD_CLAIM_DOCUMENT_DATA = [
  {
    ClaimId: 5
  },
  {
    ClaimId: 6
  }
]

var getOldEligibilityDataStub
var getOldClaimDataStub
var getOldClaimDocumentDataStub
var deleteClaimFromExternalStub
var deleteOldFilesStub

var cleanupOldData

describe('services/workers/cleanup-old-data', function () {
  beforeEach(function () {
    getOldEligibilityDataStub = sinon.stub()
    getOldClaimDataStub = sinon.stub()
    getOldClaimDocumentDataStub = sinon.stub()
    deleteClaimFromExternalStub = sinon.stub().resolves()
    deleteOldFilesStub = sinon.stub().resolves()

    cleanupOldData = proxyquire('../../../../app/services/workers/cleanup-old-data', {
      '../data/get-old-eligibility-data': getOldEligibilityDataStub,
      '../data/get-old-claim-data': getOldClaimDataStub,
      '../data/get-old-claim-document-data': getOldClaimDocumentDataStub,
      '../data/delete-claim-from-external': deleteClaimFromExternalStub,
      '../cleanup-old-data/delete-old-files': deleteOldFilesStub
    })
  })

  it('should retrieve any old eligibility records and delete them from the external database', function () {
    getOldEligibilityDataStub.resolves(OLD_ELIGIBILITY_DATA)
    getOldClaimDataStub.resolves([])
    getOldClaimDocumentDataStub.resolves([])

    return cleanupOldData.execute({}).then(function () {
      expect(getOldEligibilityDataStub.calledOnce).to.be.true //eslint-disable-line
      expect(getOldClaimDataStub.calledOnce).to.be.true //eslint-disable-line
      expect(deleteOldFilesStub.calledTwice).to.be.true //eslint-disable-line
      expect(deleteClaimFromExternalStub.calledWith(OLD_ELIGIBILITY_DATA[0].EligibilityId, OLD_ELIGIBILITY_DATA[0].ClaimId)).to.be.true //eslint-disable-line
      expect(deleteClaimFromExternalStub.calledWith(OLD_ELIGIBILITY_DATA[1].EligibilityId, OLD_ELIGIBILITY_DATA[1].ClaimId)).to.be.true //eslint-disable-line
    })
  })

  it('should retrieve any old claim records and delete them from the external database', function () {
    getOldEligibilityDataStub.resolves([])
    getOldClaimDataStub.resolves(OLD_CLAIM_DATA)
    getOldClaimDocumentDataStub.resolves([])

    return cleanupOldData.execute({}).then(function () {
      expect(getOldEligibilityDataStub.calledOnce).to.be.true //eslint-disable-line
      expect(getOldClaimDataStub.calledOnce).to.be.true //eslint-disable-line
      expect(deleteOldFilesStub.calledTwice).to.be.true //eslint-disable-line
      expect(deleteClaimFromExternalStub.calledWith(OLD_CLAIM_DATA[0].EligibilityId, OLD_CLAIM_DATA[0].ClaimId)).to.be.true //eslint-disable-line
      expect(deleteClaimFromExternalStub.calledWith(OLD_CLAIM_DATA[1].EligibilityId, OLD_CLAIM_DATA[1].ClaimId)).to.be.true //eslint-disable-line
    })
  })

  it('should retrieve any old claim document records and delete them from the external database', function () {
    getOldEligibilityDataStub.resolves([])
    getOldClaimDataStub.resolves([])
    getOldClaimDocumentDataStub.resolves(OLD_CLAIM_DOCUMENT_DATA)

    return cleanupOldData.execute({}).then(function () {
      expect(getOldEligibilityDataStub.calledOnce).to.be.true //eslint-disable-line
      expect(getOldClaimDataStub.calledOnce).to.be.true //eslint-disable-line
      expect(deleteOldFilesStub.calledTwice).to.be.true //eslint-disable-line
      expect(deleteClaimFromExternalStub.calledWith(OLD_CLAIM_DOCUMENT_DATA[0].EligibilityId, OLD_CLAIM_DOCUMENT_DATA[0].ClaimId)).to.be.true //eslint-disable-line
      expect(deleteClaimFromExternalStub.calledWith(OLD_CLAIM_DOCUMENT_DATA[1].EligibilityId, OLD_CLAIM_DOCUMENT_DATA[1].ClaimId)).to.be.true //eslint-disable-line
    })
  })
})
