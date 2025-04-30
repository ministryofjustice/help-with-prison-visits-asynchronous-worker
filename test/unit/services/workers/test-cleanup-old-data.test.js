const OLD_ELIGIBILITY_DATA = [
  {
    EligibilityId: 1,
    ClaimId: 1,
  },
  {
    EligibilityId: 2,
    ClaimId: 2,
  },
]

const OLD_CLAIM_DATA = [
  {
    ClaimId: 3,
  },
  {
    ClaimId: 4,
  },
]

const OLD_CLAIM_DOCUMENT_DATA = [
  {
    ClaimId: 5,
  },
  {
    ClaimId: 6,
  },
]

const mockGetOldEligibilityData = jest.fn()
const mockGetOldClaimData = jest.fn()
const mockGetOldClaimDocumentData = jest.fn()
const mockDeleteClaimFromExternalAsTransaction = jest.fn()
const mockDeleteOldFiles = jest.fn()
let cleanupOldData

describe('services/workers/cleanup-old-data', () => {
  beforeEach(() => {
    mockDeleteClaimFromExternalAsTransaction.mockResolvedValue()
    mockDeleteOldFiles.mockResolvedValue()

    jest.mock('../../../../app/services/data/get-old-eligibility-data', () => mockGetOldEligibilityData)
    jest.mock('../../../../app/services/data/get-old-claim-data', () => mockGetOldClaimData)
    jest.mock('../../../../app/services/data/get-old-claim-document-data', () => mockGetOldClaimDocumentData)
    jest.mock(
      '../../../../app/services/data/delete-claim-from-external-as-transaction',
      () => mockDeleteClaimFromExternalAsTransaction,
    )
    jest.mock('../../../../app/services/cleanup-old-data/delete-old-files', () => mockDeleteOldFiles)

    cleanupOldData = require('../../../../app/services/workers/cleanup-old-data')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should retrieve any old eligibility records and delete them from the external database', () => {
    mockGetOldEligibilityData.mockResolvedValue(OLD_ELIGIBILITY_DATA)
    mockGetOldClaimData.mockResolvedValue([])
    mockGetOldClaimDocumentData.mockResolvedValue([])

    return cleanupOldData.cleanupOldData().then(() => {
      expect(mockGetOldEligibilityData).toHaveBeenCalledTimes(1)
      expect(mockGetOldClaimData).toHaveBeenCalledTimes(1)
      expect(mockDeleteOldFiles).toHaveBeenCalledTimes(2)
      expect(mockDeleteClaimFromExternalAsTransaction).toHaveBeenCalledWith(
        OLD_ELIGIBILITY_DATA[0].EligibilityId,
        OLD_ELIGIBILITY_DATA[0].ClaimId,
      )
      expect(mockDeleteClaimFromExternalAsTransaction).toHaveBeenCalledWith(
        OLD_ELIGIBILITY_DATA[1].EligibilityId,
        OLD_ELIGIBILITY_DATA[1].ClaimId,
      )
    })
  })

  it('should retrieve any old claim records and delete them from the external database', () => {
    mockGetOldEligibilityData.mockResolvedValue([])
    mockGetOldClaimData.mockResolvedValue(OLD_CLAIM_DATA)
    mockGetOldClaimDocumentData.mockResolvedValue([])

    return cleanupOldData.cleanupOldData().then(() => {
      expect(mockGetOldEligibilityData).toHaveBeenCalledTimes(1)
      expect(mockGetOldClaimData).toHaveBeenCalledTimes(1)
      expect(mockDeleteOldFiles).toHaveBeenCalledTimes(2)
      expect(mockDeleteClaimFromExternalAsTransaction).toHaveBeenCalledWith(
        OLD_CLAIM_DATA[0].EligibilityId,
        OLD_CLAIM_DATA[0].ClaimId,
      )
      expect(mockDeleteClaimFromExternalAsTransaction).toHaveBeenCalledWith(
        OLD_CLAIM_DATA[1].EligibilityId,
        OLD_CLAIM_DATA[1].ClaimId,
      )
    })
  })

  it('should retrieve any old claim document records and delete them from the external database', () => {
    mockGetOldEligibilityData.mockResolvedValue([])
    mockGetOldClaimData.mockResolvedValue([])
    mockGetOldClaimDocumentData.mockResolvedValue(OLD_CLAIM_DOCUMENT_DATA)

    return cleanupOldData.cleanupOldData().then(() => {
      expect(mockGetOldEligibilityData).toHaveBeenCalledTimes(1)
      expect(mockGetOldClaimData).toHaveBeenCalledTimes(1)
      expect(mockDeleteOldFiles).toHaveBeenCalledTimes(2)
      expect(mockDeleteClaimFromExternalAsTransaction).toHaveBeenCalledWith(
        OLD_CLAIM_DOCUMENT_DATA[0].EligibilityId,
        OLD_CLAIM_DOCUMENT_DATA[0].ClaimId,
      )
      expect(mockDeleteClaimFromExternalAsTransaction).toHaveBeenCalledWith(
        OLD_CLAIM_DOCUMENT_DATA[1].EligibilityId,
        OLD_CLAIM_DOCUMENT_DATA[1].ClaimId,
      )
    })
  })
})
