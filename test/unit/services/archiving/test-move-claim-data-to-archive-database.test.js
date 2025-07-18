const CLAIM_ID = 1234
const ELIGIBILITY_ID = 4321
const REFERENCE = 'MOVECLM'
const CLAIM_DATA = { Claim: { ClaimId: CLAIM_ID } }

const mockGetClaim = jest.fn()
const mockGetNumberOfClaimsForEligibility = jest.fn()
const mockGetAllClaimData = jest.fn()
const mockCopyClaimDataToArchive = jest.fn()
const mockDeleteClaimFromInternal = jest.fn()
let moveClaimDataToArchiveDatabase

describe('services/archiving/move-claim-data-to-archive-database', () => {
  beforeEach(() => {
    jest.mock('../../../../app/services/data/get-claim', () => mockGetClaim)
    jest.mock(
      '../../../../app/services/data/get-number-of-claims-for-eligibility',
      () => mockGetNumberOfClaimsForEligibility,
    )
    jest.mock('../../../../app/services/data/get-all-claim-data', () => mockGetAllClaimData)
    jest.mock('../../../../app/services/data/copy-claim-data-to-archive', () => mockCopyClaimDataToArchive)
    jest.mock('../../../../app/services/data/delete-claim-from-internal', () => mockDeleteClaimFromInternal)

    moveClaimDataToArchiveDatabase = require('../../../../app/services/archiving/move-claim-data-to-archive-database')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should retrieve claim data, copy to archive and delete from internal', () => {
    mockGetClaim.mockResolvedValue({ EligibilityId: ELIGIBILITY_ID, Reference: REFERENCE })
    mockGetNumberOfClaimsForEligibility.mockResolvedValue(1)
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA)
    mockCopyClaimDataToArchive.mockResolvedValue()
    mockDeleteClaimFromInternal.mockResolvedValue()

    return moveClaimDataToArchiveDatabase(CLAIM_ID).then(archivedClaimData => {
      expect(mockGetClaim).toHaveBeenCalledWith('IntSchema', CLAIM_ID)
      expect(mockGetNumberOfClaimsForEligibility).toHaveBeenCalledWith('IntSchema', ELIGIBILITY_ID)
      expect(mockGetAllClaimData).toHaveBeenCalledWith('IntSchema', REFERENCE, ELIGIBILITY_ID, CLAIM_ID, true)
      expect(mockCopyClaimDataToArchive).toHaveBeenCalledWith(CLAIM_DATA)
      expect(mockDeleteClaimFromInternal).toHaveBeenCalledWith(ELIGIBILITY_ID, CLAIM_ID, true)
      expect(archivedClaimData.DeleteEligibility).toBe(true)
    })
  })

  it('should not call to delete Eligibility or return optionalEligibilityId if not last claim for Eligibility', () => {
    mockGetClaim.mockResolvedValue({ EligibilityId: ELIGIBILITY_ID, Reference: REFERENCE })
    mockGetNumberOfClaimsForEligibility.mockResolvedValue(2)
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA)
    mockCopyClaimDataToArchive.mockResolvedValue()
    mockDeleteClaimFromInternal.mockResolvedValue()

    return moveClaimDataToArchiveDatabase(CLAIM_ID).then(archivedClaimData => {
      expect(mockDeleteClaimFromInternal).toHaveBeenCalledWith(ELIGIBILITY_ID, CLAIM_ID, false)
      expect(archivedClaimData.DeleteEligibility).toBe(false)
    })
  })
})
