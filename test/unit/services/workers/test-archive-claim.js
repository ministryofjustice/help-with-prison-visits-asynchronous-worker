const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const CLAIM_ID = 1234
const CLAIM_DATA = { DeleteEligibility: false, Claim: { ClaimId: CLAIM_ID } }

var archiveClaim

var moveClaimDataToArchiveDatabase
var moveClaimFilesToArchiveFileStore

describe('services/workers/archive-claim', function () {
  beforeEach(function () {
    moveClaimDataToArchiveDatabase = sinon.stub()
    moveClaimFilesToArchiveFileStore = sinon.stub()

    archiveClaim = proxyquire('../../../../app/services/workers/archive-claim', {
      '../archiving/move-claim-data-to-archive-database': moveClaimDataToArchiveDatabase,
      '../archiving/move-claim-files-to-archive-file-store': moveClaimFilesToArchiveFileStore
    })
  })

  it('should move claim data then claim files', function () {
    moveClaimDataToArchiveDatabase.resolves(CLAIM_DATA)

    return archiveClaim.execute({claimId: CLAIM_ID}).then(function () {
      expect(moveClaimDataToArchiveDatabase.calledWith(CLAIM_ID)).to.be.true
      expect(moveClaimFilesToArchiveFileStore.calledWith(CLAIM_DATA)).to.be.true
    })
  })
})
