const sinon = require('sinon')
const moment = require('moment')
const tasksEnum = require('../../../../app/constants/tasks-enum')
const reminderEnum = require('../../../../app/constants/advance-claim-reminder-enum')

jest.mock('../../../config', () => config);

jest.mock(
  '../data/get-all-open-advance-claims-for-date-of-journey-range-with-email',
  () => getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail
);

jest.mock('../data/insert-task', () => insertTask);

describe('services/send-all-advance-claim-reminders-for-day', function () {
  let sendAllAdvanceClaimRemindersForDay

  const config = { NUMBER_OF_DAYS_AFTER_DATE_OF_JOURNEY_FOR_ADVANCE_REMINDER: '1' }
  let getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail
  let insertTask

  const CLAIMS_WITH_EMAIL = [
    { Reference: 'REF1234', EligibilityId: 1, ClaimId: 1, EmailAddress: 'test1@test.com' },
    { Reference: 'REF2234', EligibilityId: 2, ClaimId: 2, EmailAddress: 'test2@test.com' }
  ]

  beforeEach(function () {
    getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail = sinon.stub().resolves(CLAIMS_WITH_EMAIL)
    insertTask = sinon.stub().resolves()

    sendAllAdvanceClaimRemindersForDay = require(
      '../../../../app/services/workers/send-all-advance-claim-reminders-for-day'
    )
  })

  it('should get open advanced claim reminders within one day of DateOfJourney and create notification tasks', function () {
    const dateCreated = moment('2016-12-08 05:00')

    const startDateString = '2016-12-07 00:00'
    const endDateString = '2016-12-07 23:59'

    return sendAllAdvanceClaimRemindersForDay.sendAllAdvanceClaimRemindersForDay(dateCreated)
      .then(function () {
        expect(getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail.calledTwice).toBe(true) //eslint-disable-line
        expect(moment(getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail.firstCall.args[0]).format('YYYY-MM-DD HH:mm')).toBe(startDateString)
        expect(moment(getAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail.firstCall.args[1]).format('YYYY-MM-DD HH:mm')).toBe(endDateString)
        expect(insertTask.callCount).toBe(4)
        expect(insertTask.firstCall.args[0]).toBe(CLAIMS_WITH_EMAIL[0].Reference)
        expect(insertTask.firstCall.args[3]).toBe(tasksEnum.ADVANCE_CLAIM_EVIDENCE_REMINDER_NOTIFICATION)
        expect(insertTask.firstCall.args[4]).toBe(`${CLAIMS_WITH_EMAIL[0].EmailAddress}~~${reminderEnum.FIRST}`)
        expect(insertTask.thirdCall.args[0]).toBe(CLAIMS_WITH_EMAIL[0].Reference)
        expect(insertTask.thirdCall.args[3]).toBe(tasksEnum.ADVANCE_CLAIM_EVIDENCE_REMINDER_NOTIFICATION)
        expect(insertTask.thirdCall.args[4]).toBe(`${CLAIMS_WITH_EMAIL[0].EmailAddress}~~${reminderEnum.SECOND}`)
      });
  })
})
