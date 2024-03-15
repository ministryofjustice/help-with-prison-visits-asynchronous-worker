const CLAIM_ID = 1234
const ELIGIBILITY_ID = 4321
const REFERENCE = 'MOVECLM'
const CLAIM_DATA = { Claim: { ClaimId: CLAIM_ID } }

let moveClaimDataToArchiveDatabase

let getClaim
let getNumberOfClaimsForEligibility
let getAllClaimData
let copyClaimDataToArchive
let deleteClaimFromInternal

jest.mock('../data/get-claim', () => getClaim)

jest.mock(
  '../data/get-number-of-claims-for-eligibility',
  () => getNumberOfClaimsForEligibility
)

jest.mock('../data/get-all-claim-data', () => getAllClaimData)
jest.mock('../data/copy-claim-data-to-archive', () => copyClaimDataToArchive)
jest.mock('../data/delete-claim-from-internal', () => deleteClaimFromInternal)

describe('services/archiving/move-claim-data-to-archive-database', function () {
  beforeEach(function () {
    getClaim = jest.fn()
    getNumberOfClaimsForEligibility = jest.fn()
    getAllClaimData = jest.fn()
    copyClaimDataToArchive = jest.fn()
    deleteClaimFromInternal = jest.fn()

    moveClaimDataToArchiveDatabase = require('../../../../app/services/archiving/move-claim-data-to-archive-database')
  })

  it('should retrieve claim data, copy to archive and delete from internal', function () {
    getClaim.mockResolvedValue({ EligibilityId: ELIGIBILITY_ID, Reference: REFERENCE })
    getNumberOfClaimsForEligibility.mockResolvedValue(1)
    getAllClaimData.mockResolvedValue(CLAIM_DATA)
    copyClaimDataToArchive.mockResolvedValue()
    deleteClaimFromInternal.mockResolvedValue()

    return moveClaimDataToArchiveDatabase(CLAIM_ID).then(function (archivedClaimData) {
      expect(getClaim.calledWith('IntSchema', CLAIM_ID)).toBe(true) //eslint-disable-line
      expect(getNumberOfClaimsForEligibility.calledWith('IntSchema', ELIGIBILITY_ID)).toBe(true) //eslint-disable-line
      expect(getAllClaimData.calledWith('IntSchema', REFERENCE, ELIGIBILITY_ID, CLAIM_ID)).toBe(true) //eslint-disable-line
      expect(copyClaimDataToArchive.calledWith(CLAIM_DATA)).toBe(true) //eslint-disable-line
      expect(deleteClaimFromInternal.calledWith(ELIGIBILITY_ID, CLAIM_ID, true)).toBe(true) //eslint-disable-line
      expect(archivedClaimData.DeleteEligibility).toBe(true) //eslint-disable-line
    })
  })

  it('should not call to delete Eligibility or return optionalEligibilityId if not last claim for Eligibility', function () {
    getClaim.mockResolvedValue({ EligibilityId: ELIGIBILITY_ID, Reference: REFERENCE })
    getNumberOfClaimsForEligibility.mockResolvedValue(2)
    getAllClaimData.mockResolvedValue(CLAIM_DATA)
    copyClaimDataToArchive.mockResolvedValue()
    deleteClaimFromInternal.mockResolvedValue()

    return moveClaimDataToArchiveDatabase(CLAIM_ID).then(function (archivedClaimData) {
      expect(deleteClaimFromInternal.calledWith(ELIGIBILITY_ID, CLAIM_ID, false)).toBe(true) //eslint-disable-line
      expect(archivedClaimData.DeleteEligibility).toBe(false) //eslint-disable-line
    })
  })
})
