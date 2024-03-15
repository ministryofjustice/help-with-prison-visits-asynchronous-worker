const sinon = require('sinon')

const CLAIM_ID = 1234
const CLAIM_DATA = { DeleteEligibility: false, Claim: { ClaimId: CLAIM_ID } }

let archiveClaim
let moveClaimDataToArchiveDatabase

jest.mock(
  '../archiving/move-claim-data-to-archive-database',
  () => moveClaimDataToArchiveDatabase
);

describe('services/workers/archive-claim', function () {
  beforeEach(function () {
    moveClaimDataToArchiveDatabase = sinon.stub()

    archiveClaim = require('../../../../app/services/workers/archive-claim')
  })

  it('should move claim data then claim files', function () {
    moveClaimDataToArchiveDatabase.resolves(CLAIM_DATA)

    return archiveClaim.execute({ claimId: CLAIM_ID }).then(function () {
      expect(moveClaimDataToArchiveDatabase.calledWith(CLAIM_ID)).toBe(true) //eslint-disable-line
    });
  })
})
