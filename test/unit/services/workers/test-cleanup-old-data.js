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

let getOldEligibilityDataStub
let getOldClaimDataStub
let getOldClaimDocumentDataStub
let deleteClaimFromExternalAsTransactionStub
let deleteOldFilesStub

let cleanupOldData

jest.mock('../data/get-old-eligibility-data', () => getOldEligibilityDataStub);
jest.mock('../data/get-old-claim-data', () => getOldClaimDataStub);
jest.mock('../data/get-old-claim-document-data', () => getOldClaimDocumentDataStub);

jest.mock(
  '../data/delete-claim-from-external-as-transaction',
  () => deleteClaimFromExternalAsTransactionStub
);

jest.mock('../cleanup-old-data/delete-old-files', () => deleteOldFilesStub);

describe('services/workers/cleanup-old-data', function () {
  beforeEach(function () {
    getOldEligibilityDataStub = sinon.stub()
    getOldClaimDataStub = sinon.stub()
    getOldClaimDocumentDataStub = sinon.stub()
    deleteClaimFromExternalAsTransactionStub = sinon.stub().resolves()
    deleteOldFilesStub = sinon.stub().resolves()

    cleanupOldData = require('../../../../app/services/workers/cleanup-old-data')
  })

  it('should retrieve any old eligibility records and delete them from the external database', function () {
    getOldEligibilityDataStub.resolves(OLD_ELIGIBILITY_DATA)
    getOldClaimDataStub.resolves([])
    getOldClaimDocumentDataStub.resolves([])

    return cleanupOldData.cleanupOldData().then(function () {
      expect(getOldEligibilityDataStub.calledOnce).toBe(true) //eslint-disable-line
      expect(getOldClaimDataStub.calledOnce).toBe(true) //eslint-disable-line
      expect(deleteOldFilesStub.calledTwice).toBe(true) //eslint-disable-line
      expect(deleteClaimFromExternalAsTransactionStub.calledWith(OLD_ELIGIBILITY_DATA[0].EligibilityId, OLD_ELIGIBILITY_DATA[0].ClaimId)).toBe(true) //eslint-disable-line
      expect(deleteClaimFromExternalAsTransactionStub.calledWith(OLD_ELIGIBILITY_DATA[1].EligibilityId, OLD_ELIGIBILITY_DATA[1].ClaimId)).toBe(true) //eslint-disable-line
    });
  })

  it('should retrieve any old claim records and delete them from the external database', function () {
    getOldEligibilityDataStub.resolves([])
    getOldClaimDataStub.resolves(OLD_CLAIM_DATA)
    getOldClaimDocumentDataStub.resolves([])

    return cleanupOldData.cleanupOldData().then(function () {
      expect(getOldEligibilityDataStub.calledOnce).toBe(true) //eslint-disable-line
      expect(getOldClaimDataStub.calledOnce).toBe(true) //eslint-disable-line
      expect(deleteOldFilesStub.calledTwice).toBe(true) //eslint-disable-line
      expect(deleteClaimFromExternalAsTransactionStub.calledWith(OLD_CLAIM_DATA[0].EligibilityId, OLD_CLAIM_DATA[0].ClaimId)).toBe(true) //eslint-disable-line
      expect(deleteClaimFromExternalAsTransactionStub.calledWith(OLD_CLAIM_DATA[1].EligibilityId, OLD_CLAIM_DATA[1].ClaimId)).toBe(true) //eslint-disable-line
    });
  })

  it('should retrieve any old claim document records and delete them from the external database', function () {
    getOldEligibilityDataStub.resolves([])
    getOldClaimDataStub.resolves([])
    getOldClaimDocumentDataStub.resolves(OLD_CLAIM_DOCUMENT_DATA)

    return cleanupOldData.cleanupOldData().then(function () {
      expect(getOldEligibilityDataStub.calledOnce).toBe(true) //eslint-disable-line
      expect(getOldClaimDataStub.calledOnce).toBe(true) //eslint-disable-line
      expect(deleteOldFilesStub.calledTwice).toBe(true) //eslint-disable-line
      expect(deleteClaimFromExternalAsTransactionStub.calledWith(OLD_CLAIM_DOCUMENT_DATA[0].EligibilityId, OLD_CLAIM_DOCUMENT_DATA[0].ClaimId)).toBe(true) //eslint-disable-line
      expect(deleteClaimFromExternalAsTransactionStub.calledWith(OLD_CLAIM_DOCUMENT_DATA[1].EligibilityId, OLD_CLAIM_DOCUMENT_DATA[1].ClaimId)).toBe(true) //eslint-disable-line
    });
  })
})
