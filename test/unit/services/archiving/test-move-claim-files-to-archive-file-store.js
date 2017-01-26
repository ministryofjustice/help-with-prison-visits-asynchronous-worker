const expect = require('chai').expect
const proxyquire = require('proxyquire')

const CLAIM_ID = 1234
const ELIGIBILITY_ID = 4321
const REFERENCE = 'MOVEFIL'
const CLAIM_DATA = { DeleteEligibility: false, Claim: { Reference: REFERENCE, EligibilityId: ELIGIBILITY_ID, ClaimId: CLAIM_ID }, ClaimDocument: [{Filepath: '1'}] }
const CLAIM_DATA_DELETE_ELIGIBILTIY = { DeleteEligibility: true, Claim: { Reference: REFERENCE, EligibilityId: ELIGIBILITY_ID, ClaimId: CLAIM_ID }, ClaimDocument: [{Filepath: '1'}] }
const CLAIM_DATA_NO_FILES = { DeleteEligibility: false, Claim: { Reference: REFERENCE, EligibilityId: ELIGIBILITY_ID, ClaimId: CLAIM_ID }, ClaimDocument: [{Filepath: null}] }

const UPLOAD_LOCATION = '/uploads'
const ARCHIVE_LOCATION = '/archive'

var moveClaimFilesToArchiveFileStore

var mv
var sourceDirectory
var targetDirectory
var calledMove = false

describe('services/archiving/move-claim-files-to-archive-file-store', function () {
  beforeEach(function () {
    calledMove = false

    mv = function (srcDir, targetDir, opt, callback) {
      calledMove = true
      sourceDirectory = srcDir
      targetDirectory = targetDir
      callback()
    }
    var config = { FILE_UPLOAD_LOCATION: UPLOAD_LOCATION, FILE_ARCHIVE_LOCATION: ARCHIVE_LOCATION }

    moveClaimFilesToArchiveFileStore = proxyquire('../../../../app/services/archiving/move-claim-files-to-archive-file-store', {
      'mv': mv,
      '../../../config': config
    })
  })

  it('should copy claim directory to archive when not archiving eligibility', function () {
    return moveClaimFilesToArchiveFileStore(CLAIM_DATA).then(function () {
      expect(sourceDirectory).to.be.equal(`${UPLOAD_LOCATION}/${REFERENCE}-${ELIGIBILITY_ID}/${CLAIM_ID}`)
      expect(targetDirectory).to.be.equal(`${ARCHIVE_LOCATION}/${REFERENCE}-${ELIGIBILITY_ID}/${CLAIM_ID}`)
    })
  })

  it('should copy eligibility directory to archive when archiving eligibility', function () {
    return moveClaimFilesToArchiveFileStore(CLAIM_DATA_DELETE_ELIGIBILTIY).then(function () {
      expect(sourceDirectory).to.be.equal(`${UPLOAD_LOCATION}/${REFERENCE}-${ELIGIBILITY_ID}`)
      expect(targetDirectory).to.be.equal(`${ARCHIVE_LOCATION}/${REFERENCE}-${ELIGIBILITY_ID}`)
    })
  })

  it('should not call move for claims without files', function () {
    return moveClaimFilesToArchiveFileStore(CLAIM_DATA_NO_FILES).then(function () {
      expect(calledMove).to.be.false
    })
  })
})
