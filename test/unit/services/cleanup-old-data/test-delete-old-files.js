const CLAIM_ID = 1234
const ELIGIBILITY_ID = 4321
const REFERENCE = 'DELFILE'
const CLAIM_DOCUMENT_FILEPATH = [{ Filepath: '1' }]
const CLAIM_DOCUMENT_NO_FILEPATH = [{}]
const CLAIM_DOCUMENT_NO_DATA = []

let mockGetClaimDocuments
let mockAWS
let deleteOldFiles
let mockDeleteFunction

jest.mock('../../../../app/services/aws-helper', () => mockAWS)
jest.mock('../../../../app/services/data/get-claim-documents', () => mockGetClaimDocuments)

describe('services/cleanup-old-data/delete-old-files', function () {
  beforeEach(function () {
    mockGetClaimDocuments = jest.fn()
    mockDeleteFunction = jest.fn()

    const helper = function () {
      return {
        delete: mockDeleteFunction
      }
    }

    mockAWS = {
      AWSHelper: helper
    }

    deleteOldFiles = require('../../../../app/services/cleanup-old-data/delete-old-files')
  })

  it('should call to delete a file based on filepath', function () {
    mockGetClaimDocuments.mockResolvedValue(CLAIM_DOCUMENT_FILEPATH)
    return deleteOldFiles(ELIGIBILITY_ID, CLAIM_ID, REFERENCE)
      .then(function () {
        expect(mockGetClaimDocuments).toHaveBeenCalledWith('ExtSchema', REFERENCE, ELIGIBILITY_ID, CLAIM_ID) //eslint-disable-line
        expect(mockDeleteFunction).toHaveBeenCalled() //eslint-disable-line
      })
  })

  it('should copy eligibility directory to archive when archiving eligibility', function () {
    mockGetClaimDocuments.mockResolvedValue(CLAIM_DOCUMENT_NO_FILEPATH)
    return deleteOldFiles(ELIGIBILITY_ID, CLAIM_ID, REFERENCE)
      .then(function () {
        expect(mockDeleteFunction).not.toHaveBeenCalled() //eslint-disable-line
      })
  })

  it('should not call to delete a file for no claim data', function () {
    mockGetClaimDocuments.mockResolvedValue(CLAIM_DOCUMENT_NO_DATA)
    return deleteOldFiles(ELIGIBILITY_ID, CLAIM_ID, REFERENCE)
      .then(function () {
        expect(mockDeleteFunction).not.toHaveBeenCalled() //eslint-disable-line
      })
  })
})
