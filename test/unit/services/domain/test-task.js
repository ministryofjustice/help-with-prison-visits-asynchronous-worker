const expect = require('chai').expect
const Task = require('../../../../app/services/domain/task')

describe('services/domain/task', function () {
  it('should construct a domain object', function (done) {
    var taskId = 1
    var taskType = 'FIRST-TIME-CLAIM-NOTIFICATION'
    var reference = '1234567'
    var claimId = 123
    var additionalData = 'additional data'
    var dateCreated = new Date(1980, 1, 2)
    var dateProcessed = new Date(1980, 1, 3)
    var status = 'PENDING'

    var task = new Task(taskId, taskType, reference, claimId, additionalData, dateCreated, dateProcessed, status)

    expect(task.taskId).to.equal(taskId)
    expect(task.task).to.equal(taskType)
    expect(task.reference).to.equal(reference)
    expect(task.claimId).to.equal(claimId)
    expect(task.additionalData).to.equal(additionalData)
    expect(task.dateCreated).to.equal(dateCreated)
    expect(task.dateProcessed).to.equal(dateProcessed)
    expect(task.status).to.equal(status)
    done()
  })
})
