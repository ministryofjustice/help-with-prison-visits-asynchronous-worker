const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'has-uploaded-prison-visit-confirmation-and-receipts'
const FAILURE_MESSAGE = 'A prison visit confirmation and/or receipts have not been uploaded'

const VISIT_CONFIRMATION_DOC_TYPE = 'VISIT-CONFIRMATION'
const UPLOADED_DOC_STATUS = 'uploaded'

module.exports = function (autoApprovalData) {
  let checkPassed
  if (autoApprovalData.ClaimDocument) {
    let prisonVisitConfirmationUploaded = false
    let allRequiredDocumentsUploaded = true

    for (let i = 0; i < autoApprovalData.ClaimDocument.length; i++) {
      const claimDocument = autoApprovalData.ClaimDocument[i]

      if (claimDocument.DocumentType === VISIT_CONFIRMATION_DOC_TYPE) {
        prisonVisitConfirmationUploaded = claimDocument.DocumentStatus === UPLOADED_DOC_STATUS
      } else if (claimDocument.DocumentStatus !== UPLOADED_DOC_STATUS) {
        allRequiredDocumentsUploaded = false
      }
    }

    checkPassed = prisonVisitConfirmationUploaded && allRequiredDocumentsUploaded
  }

  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE)
}
