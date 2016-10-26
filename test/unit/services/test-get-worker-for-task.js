const expect = require('chai').expect
const proxyquire = require('proxyquire')
const tasksEnum = require('../../../app/constants/tasks-enum')

const sendFirstTimeClaimNotification = { name: 'sendFirstTimeClaimNotification' }
const getWorkerForTask = proxyquire('../../../app/services/get-worker-for-task', {
  './workers/send-first-time-claim-notification': sendFirstTimeClaimNotification
})

describe('services/getWorkerForTask', function () {
  it('should return send-first-time-claim-notification', function (done) {
    var worker = getWorkerForTask(tasksEnum.FIRST_TIME_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendFirstTimeClaimNotification')
    done()
  })
})
