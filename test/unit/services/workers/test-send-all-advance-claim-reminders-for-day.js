const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const moment = require('moment')
const tasksEnum = require('../../../../app/constants/tasks-enum')
require('sinon-bluebird')

describe('services/send-all-advance-claim-reminders-for-day', function () {
  var sendAllAdvanceClaimRemindersForDay

  var config = { NUMBER_OF_DAYS_AFTER_DATE_OF_JOURNEY_FOR_ADVANCE_REMINDER: '1' }
  var getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail
  var insertTask

  const CLAIMS_WITH_EMAIL = [
    {Reference: 'REF1234', EligibilityId: 1, ClaimId: 1, EmailAddress: 'test1@test.com'},
    {Reference: 'REF2234', EligibilityId: 2, ClaimId: 2, EmailAddress: 'test2@test.com'}
  ]

  beforeEach(function () {
    getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail = sinon.stub().resolves(CLAIMS_WITH_EMAIL)
    insertTask = sinon.stub().resolves()

    sendAllAdvanceClaimRemindersForDay = proxyquire('../../../../app/services/workers/send-all-advance-claim-reminders-for-day', {
      '../../../config': config,
      '../data/get-all-open-advance-claims-for-date-of-journey-range-with-email': getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail,
      '../data/insert-task': insertTask
    })
  })

  it('should get open advanced claim reminders within one day of DateOfJourney and create notification tasks', function () {
    var dateCreated = moment('2016-12-08 05:00')

    var startDateString = '2016-12-07 00:00'
    var endDateString = '2016-12-07 23:59'

    return sendAllAdvanceClaimRemindersForDay.execute({ dateCreated: dateCreated })
      .then(function () {
        expect(getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail.calledOnce).to.be.true
        expect(moment(getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail.firstCall.args[0]).format('YYYY-MM-DD HH:mm')).to.be.equal(startDateString)
        expect(moment(getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail.firstCall.args[1]).format('YYYY-MM-DD HH:mm')).to.be.equal(endDateString)
        expect(insertTask.calledTwice).to.be.true
        expect(insertTask.firstCall.args[0]).to.be.equal(CLAIMS_WITH_EMAIL[0].Reference)
        expect(insertTask.firstCall.args[3]).to.be.equal(tasksEnum.ADVANCE_CLAIM_EVIDENCE_REMINDER_NOTIFICATION)
        expect(insertTask.firstCall.args[4]).to.be.equal(CLAIMS_WITH_EMAIL[0].EmailAddress)
      })
  })
})
