const expect = require('chai').expect
const hasUploadedPrisonVisitConfirmationAndReceipts = require('../../../../../app/services/auto-approval/checks/has-uploaded-prison-visit-confirmation-and-receipts')

const withVisitConfirmation = {
  ClaimDocument: [
    {
      ClaimDocumentId: 1,
      DocumentType: 'RECEIPT',
      DocumentStatus: null
    },
    {
      ClaimDocumentId: 2,
      DocumentType: 'RECEIPT',
      DocumentStatus: 'uploaded'
    },
    {
      ClaimDocumentId: 3,
      DocumentType: 'VISIT-CONFIRMATION',
      DocumentStatus: 'uploaded'
    }
  ]
}

const withoutVisitConfirmation = {
  ClaimDocument: [
    {
      ClaimDocumentId: 1,
      DocumentType: 'RECEIPT',
      DocumentStatus: 'uploaded'
    },
    {
      ClaimDocumentId: 2,
      DocumentType: 'RECEIPT',
      DocumentStatus: 'uploaded'
    },
    {
      ClaimDocumentId: 3,
      DocumentType: 'RECEIPT',
      DocumentStatus: 'uploaded'
    },
    {
      ClaimDocumentId: 4,
      DocumentType: 'VISIT-CONFIRMATION',
      DocumentStatus: null
    }
  ]
}

const validAutoApprovalData = {
  ClaimDocument: [
    {
      ClaimDocumentId: 1,
      DocumentType: 'RECEIPT',
      DocumentStatus: 'uploaded'
    },
    {
      ClaimDocumentId: 2,
      DocumentType: 'VISIT-CONFIRMATION',
      DocumentStatus: 'uploaded'
    }
  ]
}

describe('services/auto-approval/checks/has-uploaded-prison-visit-confirmation', function () {
  it('should return true if the claimant has uploaded all required documents', function () {
    const checkResult = hasUploadedPrisonVisitConfirmationAndReceipts(validAutoApprovalData)
    expect(checkResult.result).to.equal(true)
  })

  it('should return false if the claimant has not uploaded all required documents', function () {
    const checkResult = hasUploadedPrisonVisitConfirmationAndReceipts(withVisitConfirmation)
    expect(checkResult.result).to.equal(false)
  })

  it('should return false if the claimant uploaded all required documents except the prison visit confirmation', function () {
    const checkResult = hasUploadedPrisonVisitConfirmationAndReceipts(withoutVisitConfirmation)
    expect(checkResult.result).to.equal(false)
  })
})
