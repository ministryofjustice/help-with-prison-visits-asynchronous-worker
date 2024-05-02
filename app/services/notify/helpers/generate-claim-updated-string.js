module.exports = function (updatedDocuments) {
  const NEWLINE = '<br />'

  let message
  if (updatedDocuments && updatedDocuments.length > 0) {
    message = 'Claimant updated claim:'

    message += NEWLINE
    updatedDocuments.forEach(function (document) {
      message = `${message + NEWLINE} - updated document ${document.DocumentType} with status ${document.DocumentStatus}`
    })
  }

  return message
}
