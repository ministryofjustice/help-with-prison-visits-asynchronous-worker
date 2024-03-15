const CLAIM_ID = 1234
const ELIGIBILITY_ID = 4321
const REFERENCE = 'DELFILE'
const CLAIM_DOCUMENT_FILEPATH = [{ Filepath: '1' }]
const CLAIM_DOCUMENT_NO_FILEPATH = [{}]
const CLAIM_DOCUMENT_NO_DATA = []

let getClaimDocuments
let AWS
let deleteOldFiles
let deleteFunction

jest.mock('../aws-helper', () => AWS)
jest.mock('../data/get-claim-documents', () => getClaimDocuments)

describe('services/cleanup-old-data/delete-old-files', function () {
  beforeEach(function () {
    getClaimDocuments = jest.fn()
    deleteFunction = jest.fn()

    const helper = function () {
      return {
        delete: deleteFunction
      }
    }

    AWS = {
      AWSHelper: helper
    }

    deleteOldFiles = require('../../../../app/services/cleanup-old-data/delete-old-files')
  })

  it('should call to delete a file based on filepath', function () {
    getClaimDocuments.mockResolvedValue(CLAIM_DOCUMENT_FILEPATH)
    return deleteOldFiles(ELIGIBILITY_ID, CLAIM_ID, REFERENCE)
      .then(function () {
        expect(getClaimDocuments.calledWith('ExtSchema', REFERENCE, ELIGIBILITY_ID, CLAIM_ID)).toBe(true) //eslint-disable-line
        expect(deleteFunction.called).toBe(true) //eslint-disable-line
      })
  })

  it('should copy eligibility directory to archive when archiving eligibility', function () {
    getClaimDocuments.mockResolvedValue(CLAIM_DOCUMENT_NO_FILEPATH)
    return deleteOldFiles(ELIGIBILITY_ID, CLAIM_ID, REFERENCE)
      .then(function () {
        expect(deleteFunction.called).toBe(false) //eslint-disable-line
      })
  })

  it('should not call to delete a file for no claim data', function () {
    getClaimDocuments.mockResolvedValue(CLAIM_DOCUMENT_NO_DATA)
    return deleteOldFiles(ELIGIBILITY_ID, CLAIM_ID, REFERENCE)
      .then(function () {
        expect(deleteFunction.called).toBe(false) //eslint-disable-line
      })
  })
})
