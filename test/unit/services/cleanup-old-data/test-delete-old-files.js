const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')


const CLAIM_ID = 1234
const ELIGIBILITY_ID = 4321
const REFERENCE = 'DELFILE'
const CLAIM_DOCUMENT_FILEPATH = [{ Filepath: '1' }]
const CLAIM_DOCUMENT_NO_FILEPATH = [{}]
const CLAIM_DOCUMENT_NO_DATA = []

var fs
var getClaimDocuments
var calledFsUnlinkSync = false

var deleteOldFiles

describe('services/cleanup-old-data/delete-old-files', function () {
  beforeEach(function () {
    getClaimDocuments = sinon.stub()
    calledFsUnlinkSync = false

    fs = {
      unlinkSync: function () {
        calledFsUnlinkSync = true
      }
    }

    deleteOldFiles = proxyquire('../../../../app/services/cleanup-old-data/delete-old-files', {
      fs: fs,
      '../data/get-claim-documents': getClaimDocuments
    })
  })

  it('should call to delete a file based on filepath', function () {
    getClaimDocuments.resolves(CLAIM_DOCUMENT_FILEPATH)
    return deleteOldFiles(ELIGIBILITY_ID, CLAIM_ID, REFERENCE)
      .then(function () {
        expect(getClaimDocuments.calledWith('ExtSchema', REFERENCE, ELIGIBILITY_ID, CLAIM_ID)).to.be.true //eslint-disable-line
        expect(calledFsUnlinkSync).to.be.true //eslint-disable-line
      })
  })

  it('should copy eligibility directory to archive when archiving eligibility', function () {
    getClaimDocuments.resolves(CLAIM_DOCUMENT_NO_FILEPATH)
    return deleteOldFiles(ELIGIBILITY_ID, CLAIM_ID, REFERENCE)
      .then(function () {
        expect(calledFsUnlinkSync).to.be.false //eslint-disable-line
      })
  })

  it('should not call to delete a file for no claim data', function () {
    getClaimDocuments.resolves(CLAIM_DOCUMENT_NO_DATA)
    return deleteOldFiles(ELIGIBILITY_ID, CLAIM_ID, REFERENCE)
      .then(function () {
        expect(calledFsUnlinkSync).to.be.false //eslint-disable-line
      })
  })
})
