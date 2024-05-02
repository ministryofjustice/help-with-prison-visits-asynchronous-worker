const CLAIM_ID = 1234
const CLAIM_DATA = { DeleteEligibility: false, Claim: { ClaimId: CLAIM_ID } }

let archiveClaim
let mockMoveClaimDataToArchiveDatabase

jest.mock(
  '../../../../app/services/archiving/move-claim-data-to-archive-database',
  () => mockMoveClaimDataToArchiveDatabase,
)

describe('services/workers/archive-claim', function () {
  beforeEach(function () {
    mockMoveClaimDataToArchiveDatabase = jest.fn()

    archiveClaim = require('../../../../app/services/workers/archive-claim')
  })

  it('should move claim data then claim files', function () {
    mockMoveClaimDataToArchiveDatabase.mockResolvedValue(CLAIM_DATA)

    return archiveClaim.execute({ claimId: CLAIM_ID }).then(function () {
      expect(mockMoveClaimDataToArchiveDatabase).toHaveBeenCalledWith(CLAIM_ID)
    })
  })
})
