const Task = require('../../../../app/services/domain/task')

describe('services/domain/task', function () {
  it('should construct a domain object', function (done) {
    const taskId = 1
    const taskType = 'FIRST-TIME-CLAIM-NOTIFICATION'
    const reference = 'NEW4567'
    const eligibilityId = '123'
    const claimId = 123
    const additionalData = 'additional data'
    const dateCreated = new Date(1980, 1, 2)
    const dateProcessed = new Date(1980, 1, 3)
    const schema = 'IntSchema'
    const status = 'PENDING'

    const task = new Task(taskId, taskType, reference, eligibilityId, claimId, additionalData, dateCreated, dateProcessed, schema, status)

    expect(task.taskId).toBe(taskId)
    expect(task.task).toBe(taskType)
    expect(task.reference).toBe(reference)
    expect(task.eligibilityId).toBe(eligibilityId)
    expect(task.claimId).toBe(claimId)
    expect(task.additionalData).toBe(additionalData)
    expect(task.dateCreated).toBe(dateCreated)
    expect(task.dateProcessed).toBe(dateProcessed)
    expect(task.schema).toBe(schema)
    expect(task.status).toBe(status)
    done()
  })
})
