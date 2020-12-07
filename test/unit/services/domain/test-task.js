const expect = require('chai').expect
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

    expect(task.taskId).to.equal(taskId)
    expect(task.task).to.equal(taskType)
    expect(task.reference).to.equal(reference)
    expect(task.eligibilityId).to.equal(eligibilityId)
    expect(task.claimId).to.equal(claimId)
    expect(task.additionalData).to.equal(additionalData)
    expect(task.dateCreated).to.equal(dateCreated)
    expect(task.dateProcessed).to.equal(dateProcessed)
    expect(task.schema).to.equal(schema)
    expect(task.status).to.equal(status)
    done()
  })
})
