// const expect = require('chai').expect
// const proxyquire = require('proxyquire')
// const sinon = require('sinon')
// require('sinon-bluebird')

// const claim1 = {ClaimId: 1, Reference: 'MARKING', Amount: 100}
// const claim2 = {ClaimId: 2, Reference: 'M@RKING', Amount: 104}
// const claims = [claim1, claim2]

// const getAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmountStub = sinon.stub().resolves(claims)
// const insertTask = sinon.stub.resolves()

// const addMarkAsOverpaymentTask = proxyquire('../../../../app/services/overpayment/add-mark-as-overpayment-task')

// describe('services/overpayment/add-mark-as-overpayment-task', function () {
//   it('find all claims that are should be overpaid, then adds a task to mark them', function () {
//     var taskId = 1
//     var taskType = 'FIRST-TIME-CLAIM-NOTIFICATION'
//     var reference = 'NEW4567'
//     var eligibilityId = '123'
//     var claimId = 123
//     var additionalData = 'additional data'
//     var dateCreated = new Date(1980, 1, 2)
//     var dateProcessed = new Date(1980, 1, 3)
//     var schema = 'IntSchema'
//     var status = 'PENDING'

//     var task = new Task(taskId, taskType, reference, eligibilityId, claimId, additionalData, dateCreated, dateProcessed, schema, status)

//     expect(task.taskId).to.equal(taskId)
//     expect(task.task).to.equal(taskType)
//     expect(task.reference).to.equal(reference)
//     expect(task.eligibilityId).to.equal(eligibilityId)
//     expect(task.claimId).to.equal(claimId)
//     expect(task.additionalData).to.equal(additionalData)
//     expect(task.dateCreated).to.equal(dateCreated)
//     expect(task.dateProcessed).to.equal(dateProcessed)
//     expect(task.schema).to.equal(schema)
//     expect(task.status).to.equal(status)
//     done()
//   })
// })
