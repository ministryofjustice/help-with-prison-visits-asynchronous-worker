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

let mockGetOldEligibilityData
let mockGetOldClaimData
let mockGetOldClaimDocumentData
let mockDeleteClaimFromExternalAsTransaction
let mockDeleteOldFiles

let cleanupOldData

jest.mock('../../../../app/services/data/get-old-eligibility-data', () => mockGetOldEligibilityData)
jest.mock('../../../../app/services/data/get-old-claim-data', () => mockGetOldClaimData)
jest.mock('../../../../app/services/data/get-old-claim-document-data', () => mockGetOldClaimDocumentData)

jest.mock(
  '../../../../app/services/data/delete-claim-from-external-as-transaction',
  () => mockDeleteClaimFromExternalAsTransaction
)

jest.mock('../../../../app/services/cleanup-old-data/delete-old-files', () => mockDeleteOldFiles)

describe('services/workers/cleanup-old-data', function () {
  beforeEach(function () {
    mockGetOldEligibilityData = jest.fn()
    mockGetOldClaimData = jest.fn()
    mockGetOldClaimDocumentData = jest.fn()
    mockDeleteClaimFromExternalAsTransaction = jest.fn().mockResolvedValue()
    mockDeleteOldFiles = jest.fn().mockResolvedValue()

    cleanupOldData = require('../../../../app/services/workers/cleanup-old-data')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should retrieve any old eligibility records and delete them from the external database', function () {
    mockGetOldEligibilityData.mockResolvedValue(OLD_ELIGIBILITY_DATA)
    mockGetOldClaimData.mockResolvedValue([])
    mockGetOldClaimDocumentData.mockResolvedValue([])

    return cleanupOldData.cleanupOldData().then(function () {
      expect(mockGetOldEligibilityData).toHaveBeenCalledTimes(1) //eslint-disable-line
      expect(mockGetOldClaimData).toHaveBeenCalledTimes(1) //eslint-disable-line
      expect(mockDeleteOldFiles).toHaveBeenCalledTimes(2) //eslint-disable-line
      expect(mockDeleteClaimFromExternalAsTransaction).toHaveBeenCalledWith(OLD_ELIGIBILITY_DATA[0].EligibilityId, OLD_ELIGIBILITY_DATA[0].ClaimId) //eslint-disable-line
      expect(mockDeleteClaimFromExternalAsTransaction).toHaveBeenCalledWith(OLD_ELIGIBILITY_DATA[1].EligibilityId, OLD_ELIGIBILITY_DATA[1].ClaimId) //eslint-disable-line
    })
  })

  it('should retrieve any old claim records and delete them from the external database', function () {
    mockGetOldEligibilityData.mockResolvedValue([])
    mockGetOldClaimData.mockResolvedValue(OLD_CLAIM_DATA)
    mockGetOldClaimDocumentData.mockResolvedValue([])

    return cleanupOldData.cleanupOldData().then(function () {
      expect(mockGetOldEligibilityData).toHaveBeenCalledTimes(1) //eslint-disable-line
      expect(mockGetOldClaimData).toHaveBeenCalledTimes(1) //eslint-disable-line
      expect(mockDeleteOldFiles).toHaveBeenCalledTimes(2) //eslint-disable-line
      expect(mockDeleteClaimFromExternalAsTransaction).toHaveBeenCalledWith(OLD_CLAIM_DATA[0].EligibilityId, OLD_CLAIM_DATA[0].ClaimId) //eslint-disable-line
      expect(mockDeleteClaimFromExternalAsTransaction).toHaveBeenCalledWith(OLD_CLAIM_DATA[1].EligibilityId, OLD_CLAIM_DATA[1].ClaimId) //eslint-disable-line
    })
  })

  it('should retrieve any old claim document records and delete them from the external database', function () {
    mockGetOldEligibilityData.mockResolvedValue([])
    mockGetOldClaimData.mockResolvedValue([])
    mockGetOldClaimDocumentData.mockResolvedValue(OLD_CLAIM_DOCUMENT_DATA)

    return cleanupOldData.cleanupOldData().then(function () {
      expect(mockGetOldEligibilityData).toHaveBeenCalledTimes(1) //eslint-disable-line
      expect(mockGetOldClaimData).toHaveBeenCalledTimes(1) //eslint-disable-line
      expect(mockDeleteOldFiles).toHaveBeenCalledTimes(2) //eslint-disable-line
      expect(mockDeleteClaimFromExternalAsTransaction).toHaveBeenCalledWith(OLD_CLAIM_DOCUMENT_DATA[0].EligibilityId, OLD_CLAIM_DOCUMENT_DATA[0].ClaimId) //eslint-disable-line
      expect(mockDeleteClaimFromExternalAsTransaction).toHaveBeenCalledWith(OLD_CLAIM_DOCUMENT_DATA[1].EligibilityId, OLD_CLAIM_DOCUMENT_DATA[1].ClaimId) //eslint-disable-line
    })
  })
})
