class Task {
  constructor (taskId, task, reference, eligibilityId, claimId, additionalData, dateCreated, dateProcessed, schema, status) {
    this.taskId = taskId
    this.task = task
    this.reference = reference
    this.eligibilityId = eligibilityId
    this.claimId = claimId
    this.additionalData = additionalData
    this.dateCreated = dateCreated
    this.dateProcessed = dateProcessed
    this.schema = schema
    this.status = status
  }
}

module.exports = Task
