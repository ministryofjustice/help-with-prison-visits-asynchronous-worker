const CLAIM_ID = 1234
const ELIGIBILITY_ID = 4321
const REFERENCE = 'DELFILE'
const CLAIM_DOCUMENT_FILEPATH = [{ Filepath: '1' }]
const CLAIM_DOCUMENT_NO_FILEPATH = [{}]
const CLAIM_DOCUMENT_NO_DATA = []

let mockGetClaimDocuments
let deleteOldFiles
let mockDeleteFunction

jest.mock('../../../../app/services/data/get-claim-documents', () => mockGetClaimDocuments)

describe('services/cleanup-old-data/delete-old-files', () => {
  beforeEach(() => {
    mockGetClaimDocuments = jest.fn()
    mockDeleteFunction = jest.fn()

    jest.mock('../../../../app/services/aws-helper', () => {
      return jest.fn().mockImplementation(() => ({
        delete: mockDeleteFunction,
      }))
    })

    deleteOldFiles = require('../../../../app/services/cleanup-old-data/delete-old-files')
  })

  it('should call to delete a file based on filepath', () => {
    mockGetClaimDocuments.mockResolvedValue(CLAIM_DOCUMENT_FILEPATH)

    return deleteOldFiles(ELIGIBILITY_ID, CLAIM_ID, REFERENCE).then(() => {
      expect(mockGetClaimDocuments).toHaveBeenCalledWith('ExtSchema', REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      expect(mockDeleteFunction).toHaveBeenCalled()
    })
  })

  it('should copy eligibility directory to archive when archiving eligibility', () => {
    mockGetClaimDocuments.mockResolvedValue(CLAIM_DOCUMENT_NO_FILEPATH)
    return deleteOldFiles(ELIGIBILITY_ID, CLAIM_ID, REFERENCE).then(() => {
      expect(mockDeleteFunction).not.toHaveBeenCalled()
    })
  })

  it('should not call to delete a file for no claim data', () => {
    mockGetClaimDocuments.mockResolvedValue(CLAIM_DOCUMENT_NO_DATA)
    return deleteOldFiles(ELIGIBILITY_ID, CLAIM_ID, REFERENCE).then(() => {
      expect(mockDeleteFunction).not.toHaveBeenCalled()
    })
  })
})
