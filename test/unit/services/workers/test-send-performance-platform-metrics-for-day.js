const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const moment = require('moment')
require('sinon-bluebird')

const SUBMITTED_CLAIM_COUNT = 100

describe('services/send-request-information-response-submitted-notification', function () {
  var sendPerformancePlatformMetricsForDay

  var configStub
  var getNumberOfSubmittedClaimsForDateRangeStub
  var postPerformancePlatformMetricsForDayStub

  beforeEach(function () {
    configStub = { PERFORMANCE_PLATFORM_SEND_ENABLED: 'true' }
    getNumberOfSubmittedClaimsForDateRangeStub = sinon.stub().resolves(SUBMITTED_CLAIM_COUNT)
    postPerformancePlatformMetricsForDayStub = sinon.stub().resolves()

    sendPerformancePlatformMetricsForDay = proxyquire('../../../../app/services/workers/send-performance-platform-metrics-for-day', {
      '../../../config': configStub,
      '../data/get-number-of-submitted-claims-for-date-range': getNumberOfSubmittedClaimsForDateRangeStub,
      '../performance-platform/post-performance-platform-metrics-for-day': postPerformancePlatformMetricsForDayStub
    })
  })

  it('should do nothing if disabled by config', function () {
    configStub.PERFORMANCE_PLATFORM_SEND_ENABLED = 'false'
    return sendPerformancePlatformMetricsForDay.execute({ dateCreated: new Date() })
      .then(function () {
        expect(getNumberOfSubmittedClaimsForDateRangeStub.called).to.be.false
        expect(postPerformancePlatformMetricsForDayStub.called).to.be.false
      })
  })

  it('should call post-performance-platform-metrics-for-day with submittedClaimCount', function () {
    var dateCreated = moment('2016-12-08 05:00')

    var startDateString = '2016-12-07 00:00'
    var endDateString = '2016-12-07 23:59'

    return sendPerformancePlatformMetricsForDay.execute({ dateCreated: dateCreated })
      .then(function () {
        expect(getNumberOfSubmittedClaimsForDateRangeStub.calledOnce).to.be.true
        expect(moment(getNumberOfSubmittedClaimsForDateRangeStub.firstCall.args[0]).format('YYYY-MM-DD HH:mm')).to.be.equal(startDateString)
        expect(moment(getNumberOfSubmittedClaimsForDateRangeStub.firstCall.args[1]).format('YYYY-MM-DD HH:mm')).to.be.equal(endDateString)
        expect(postPerformancePlatformMetricsForDayStub.calledOnce).to.be.true
        expect(postPerformancePlatformMetricsForDayStub.firstCall.args[1]).to.be.equal(SUBMITTED_CLAIM_COUNT)
      })
  })
})
