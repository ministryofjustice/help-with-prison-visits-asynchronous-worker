module.exports = function (note, updatedDocuments) {
  const NEWLINE = '<br />'
  var message = 'Claimant updated claim:'
console.log(note)
  if (note) {
    message = message + NEWLINE + note
  }

  if (updatedDocuments && updatedDocuments.length > 0) {
    message = message + NEWLINE
    updatedDocuments.forEach(function (document) {
      message = message + NEWLINE + ` - updated document ${document.DocumentType} with status ${document.DocumentStatus}`
    })
  }

  return message
}
