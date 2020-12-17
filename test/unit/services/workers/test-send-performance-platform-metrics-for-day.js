const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const moment = require('moment')

const dateFormatter = require('../../../../app/services/date-formatter')

const SUBMITTED_CLAIM_COUNT = 100

describe('services/workers/send-performance-platform-metrics-for-day', function () {
  let sendPerformancePlatformMetricsForDay

  let configStub
  let getNumberOfSubmittedClaimsForDateRangeStub
  let sendPerformancePlatformMetricsForDayStub

  beforeEach(function () {
    configStub = { PERFORMANCE_PLATFORM_SEND_ENABLED: 'true' }
    getNumberOfSubmittedClaimsForDateRangeStub = sinon.stub().resolves(SUBMITTED_CLAIM_COUNT)
    sendPerformancePlatformMetricsForDayStub = sinon.stub().resolves()

    sendPerformancePlatformMetricsForDay = proxyquire('../../../../app/services/workers/send-performance-platform-metrics-for-day', {
      '../../../config': configStub,
      '../data/get-number-of-submitted-claims-for-date-range': getNumberOfSubmittedClaimsForDateRangeStub,
      '../performance-platform/send-performance-platform-metrics-for-day': sendPerformancePlatformMetricsForDayStub
    })
  })

  it('should do nothing if disabled by config', function () {
    configStub.PERFORMANCE_PLATFORM_SEND_ENABLED = 'false'
    return sendPerformancePlatformMetricsForDay.execute({ dateCreated: dateFormatter.now().toDate() })
      .then(function () {
        expect(getNumberOfSubmittedClaimsForDateRangeStub.called).to.be.false //eslint-disable-line
        expect(sendPerformancePlatformMetricsForDayStub.called).to.be.false //eslint-disable-line
      })
  })

  it('should call send-performance-platform-metrics-for-day with submittedClaimCount', function () {
    const dateCreated = moment('2016-12-08 05:00')

    const startDateString = '2016-12-07 00:00'
    const endDateString = '2016-12-07 23:59'

    return sendPerformancePlatformMetricsForDay.execute({ dateCreated: dateCreated })
      .then(function () {
        expect(getNumberOfSubmittedClaimsForDateRangeStub.calledOnce).to.be.true //eslint-disable-line
        expect(moment(getNumberOfSubmittedClaimsForDateRangeStub.firstCall.args[0]).format('YYYY-MM-DD HH:mm')).to.be.equal(startDateString)
        expect(moment(getNumberOfSubmittedClaimsForDateRangeStub.firstCall.args[1]).format('YYYY-MM-DD HH:mm')).to.be.equal(endDateString)
        expect(sendPerformancePlatformMetricsForDayStub.calledOnce).to.be.true //eslint-disable-line
        expect(sendPerformancePlatformMetricsForDayStub.firstCall.args[1]).to.be.equal(SUBMITTED_CLAIM_COUNT)
      })
  })
})
