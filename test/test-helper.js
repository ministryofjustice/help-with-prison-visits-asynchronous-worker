module.exports.getTaskObject = function (taskType, additionalData, taskStatus) {
  var reference = '1234567'
  var claimId = 123
  var dateCreated = new Date()
  var dateProcessed = null
  var status = taskStatus || 'PENDING'

  return {
    Task: taskType,
    Reference: reference,
    ClaimId: claimId,
    AdditionalData: additionalData,
    DateCreated: dateCreated,
    DateProcessed: dateProcessed,
    Status: status
  }
}
