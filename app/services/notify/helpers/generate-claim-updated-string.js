module.exports = function (updatedDocuments) {
  const NEWLINE = '<br />'

  if (updatedDocuments && updatedDocuments.length > 0) {
    var message = 'Claimant updated claim:'

    message = message + NEWLINE
    updatedDocuments.forEach(function (document) {
      message = message + NEWLINE + ` - updated document ${document.DocumentType} with status ${document.DocumentStatus}`
    })
  }

  return message
}
