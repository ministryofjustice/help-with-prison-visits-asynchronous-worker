const expect = require('chai').expect
const proxyquire = require('proxyquire')
const tasksEnum = require('../../../app/constants/tasks-enum')

const sendAcceptedClaimNotification = { name: 'sendAcceptedClaimNotification' }
const sendRejectedClaimNotification = { name: 'sendRejectedClaimNotification' }
const sendRequestInformationClaimNotification = { name: 'sendRequestInformationClaimNotification' }
const sendFirstTimeClaimNotification = { name: 'sendFirstTimeClaimNotification' }
const completeFirstTimeClaim = { name: 'completeFirstTimeClaim' }
const dwpCheck = { name: 'dwpCheck' }

const getWorkerForTask = proxyquire('../../../app/services/get-worker-for-task', {
  './workers/send-accepted-claim-notification': sendAcceptedClaimNotification,
  './workers/send-rejected-claim-notification': sendRejectedClaimNotification,
  './workers/send-request-information-claim-notification': sendRequestInformationClaimNotification,
  './workers/send-first-time-claim-notification': sendFirstTimeClaimNotification,
  './workers/complete-first-time-claim': completeFirstTimeClaim,
  './workers/dwp-check': dwpCheck
})

describe('services/getWorkerForTask', function () {
  it('should return send-accepted-claim-notification', function () {
    var worker = getWorkerForTask(tasksEnum.ACCEPT_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendAcceptedClaimNotification')
  })

  it('should return send-rejected-claim-notification', function () {
    var worker = getWorkerForTask(tasksEnum.REJECT_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendRejectedClaimNotification')
  })

  it('should return send-request-information-claim-notification', function () {
    var worker = getWorkerForTask(tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendRequestInformationClaimNotification')
  })

  it('should return send-first-time-claim-notification', function () {
    var worker = getWorkerForTask(tasksEnum.FIRST_TIME_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendFirstTimeClaimNotification')
  })

  it('should return complete-first-time-claim', function () {
    var worker = getWorkerForTask(tasksEnum.COMPLETE_FIRST_TIME_CLAIM)
    expect(worker.name).to.be.equal('completeFirstTimeClaim')
  })

  it('should return dwp-check', function () {
    var worker = getWorkerForTask(tasksEnum.DWP_CHECK)
    expect(worker.name).to.be.equal('dwpCheck')
  })
})
