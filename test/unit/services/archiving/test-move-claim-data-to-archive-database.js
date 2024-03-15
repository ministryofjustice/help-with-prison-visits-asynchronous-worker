const CLAIM_ID = 1234
const ELIGIBILITY_ID = 4321
const REFERENCE = 'MOVECLM'
const CLAIM_DATA = { Claim: { ClaimId: CLAIM_ID } }

let moveClaimDataToArchiveDatabase

let mockGetClaim
let mockGetNumberOfClaimsForEligibility
let mockGetAllClaimData
let mockCopyClaimDataToArchive
let mockDeleteClaimFromInternal

jest.mock('../../../../app/services/data/get-claim', () => mockGetClaim)

jest.mock(
  '../../../../app/services/data/get-number-of-claims-for-eligibility',
  () => mockGetNumberOfClaimsForEligibility
)

jest.mock('../../../../app/services/data/get-all-claim-data', () => mockGetAllClaimData)
jest.mock('../../../../app/services/data/copy-claim-data-to-archive', () => mockCopyClaimDataToArchive)
jest.mock('../../../../app/services/data/delete-claim-from-internal', () => mockDeleteClaimFromInternal)

describe('services/archiving/move-claim-data-to-archive-database', function () {
  beforeEach(function () {
    mockGetClaim = jest.fn()
    mockGetNumberOfClaimsForEligibility = jest.fn()
    mockGetAllClaimData = jest.fn()
    mockCopyClaimDataToArchive = jest.fn()
    mockDeleteClaimFromInternal = jest.fn()

    moveClaimDataToArchiveDatabase = require('../../../../app/services/archiving/move-claim-data-to-archive-database')
  })

  it('should retrieve claim data, copy to archive and delete from internal', function () {
    mockGetClaim.mockResolvedValue({ EligibilityId: ELIGIBILITY_ID, Reference: REFERENCE })
    mockGetNumberOfClaimsForEligibility.mockResolvedValue(1)
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA)
    mockCopyClaimDataToArchive.mockResolvedValue()
    mockDeleteClaimFromInternal.mockResolvedValue()

    return moveClaimDataToArchiveDatabase(CLAIM_ID).then(function (archivedClaimData) {
      expect(mockGetClaim).toHaveBeenCalledWith('IntSchema', CLAIM_ID) //eslint-disable-line
      expect(mockGetNumberOfClaimsForEligibility).toHaveBeenCalledWith('IntSchema', ELIGIBILITY_ID) //eslint-disable-line
      expect(mockGetAllClaimData).toHaveBeenCalledWith('IntSchema', REFERENCE, ELIGIBILITY_ID, CLAIM_ID, true) //eslint-disable-line
      expect(mockCopyClaimDataToArchive).toHaveBeenCalledWith(CLAIM_DATA) //eslint-disable-line
      expect(mockDeleteClaimFromInternal).toHaveBeenCalledWith(ELIGIBILITY_ID, CLAIM_ID, true) //eslint-disable-line
      expect(archivedClaimData.DeleteEligibility).toBe(true) //eslint-disable-line
    })
  })

  it('should not call to delete Eligibility or return optionalEligibilityId if not last claim for Eligibility', function () {
    mockGetClaim.mockResolvedValue({ EligibilityId: ELIGIBILITY_ID, Reference: REFERENCE })
    mockGetNumberOfClaimsForEligibility.mockResolvedValue(2)
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA)
    mockCopyClaimDataToArchive.mockResolvedValue()
    mockDeleteClaimFromInternal.mockResolvedValue()

    return moveClaimDataToArchiveDatabase(CLAIM_ID).then(function (archivedClaimData) {
      expect(mockDeleteClaimFromInternal).toHaveBeenCalledWith(ELIGIBILITY_ID, CLAIM_ID, false) //eslint-disable-line
      expect(archivedClaimData.DeleteEligibility).toBe(false) //eslint-disable-line
    })
  })
})
