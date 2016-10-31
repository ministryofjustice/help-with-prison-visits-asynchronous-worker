const expect = require('chai').expect
const proxyquire = require('proxyquire')
const tasksEnum = require('../../../app/constants/tasks-enum')

const sendAcceptedClaimNotification = { name: 'sendAcceptedClaimNotification' }
const sendRejectedClaimNotification = { name: 'sendRejectedClaimNotification' }
const sendFirstTimeClaimNotification = { name: 'sendFirstTimeClaimNotification' }
const completeFirstTimeClaim = { name: 'completeFirstTimeClaim' }

const getWorkerForTask = proxyquire('../../../app/services/get-worker-for-task', {
  './workers/send-accepted-claim-notification': sendAcceptedClaimNotification,
  './workers/send-rejected-claim-notification': sendRejectedClaimNotification,
  './workers/send-first-time-claim-notification': sendFirstTimeClaimNotification,
  './workers/complete-first-time-claim': completeFirstTimeClaim
})

describe('services/getWorkerForTask', function () {
  it('should return send-accepted-claim-notification', function (done) {
    var worker = getWorkerForTask(tasksEnum.ACCEPT_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendAcceptedClaimNotification')
    done()
  })

  it('should return send-rejected-claim-notification', function (done) {
    var worker = getWorkerForTask(tasksEnum.REJECT_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendRejectedClaimNotification')
    done()
  })

  it('should return send-first-time-claim-notification', function (done) {
    var worker = getWorkerForTask(tasksEnum.FIRST_TIME_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendFirstTimeClaimNotification')
    done()
  })

  it('should return complete-first-time-claim', function (done) {
    var worker = getWorkerForTask(tasksEnum.COMPLETE_FIRST_TIME_CLAIM)
    expect(worker.name).to.be.equal('completeFirstTimeClaim')
    done()
  })
})
