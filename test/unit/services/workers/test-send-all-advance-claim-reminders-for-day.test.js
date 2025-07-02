const moment = require('moment')
const tasksEnum = require('../../../../app/constants/tasks-enum')
const reminderEnum = require('../../../../app/constants/advance-claim-reminder-enum')

describe('services/send-all-advance-claim-reminders-for-day', () => {
  let sendAllAdvanceClaimRemindersForDay

  const mockConfig = { NUMBER_OF_DAYS_AFTER_DATE_OF_JOURNEY_FOR_ADVANCE_REMINDER: '1' }
  let mockGetAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail
  let mockInsertTask

  const CLAIMS_WITH_EMAIL = [
    { Reference: 'REF1234', EligibilityId: 1, ClaimId: 1, EmailAddress: 'test1@test.com' },
    { Reference: 'REF2234', EligibilityId: 2, ClaimId: 2, EmailAddress: 'test2@test.com' },
  ]

  beforeEach(() => {
    mockGetAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail = jest.fn().mockResolvedValue(CLAIMS_WITH_EMAIL)
    mockInsertTask = jest.fn().mockResolvedValue()

    jest.mock('../../../../config', () => mockConfig)
    jest.mock(
      '../../../../app/services/data/get-all-open-advance-claims-for-date-of-journey-range-with-email',
      () => mockGetAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail,
    )
    jest.mock('../../../../app/services/data/insert-task', () => mockInsertTask)

    sendAllAdvanceClaimRemindersForDay = require('../../../../app/services/workers/send-all-advance-claim-reminders-for-day')
  })

  it('should get open advanced claim reminders within one day of DateOfJourney and create notification tasks', () => {
    const dateCreated = moment('2016-12-08 05:00')
    const startDateString = '2016-12-07 00:00'
    const endDateString = '2016-12-07 23:59'

    return sendAllAdvanceClaimRemindersForDay.sendAllAdvanceClaimRemindersForDay(dateCreated).then(() => {
      expect(mockGetAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail).toHaveBeenCalledTimes(2)
      expect(
        moment(mockGetAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail.mock.calls[0][0]).format('YYYY-MM-DD HH:mm'),
      ).toBe(startDateString)
      expect(
        moment(mockGetAllOpenAdvanceClaimsForDateOfJourneyRangeWithEmail.mock.calls[0][1]).format('YYYY-MM-DD HH:mm'),
      ).toBe(endDateString)
      expect(mockInsertTask).toHaveBeenCalledTimes(4)
      expect(mockInsertTask.mock.calls[0][0]).toBe(CLAIMS_WITH_EMAIL[0].Reference)
      expect(mockInsertTask.mock.calls[0][3]).toBe(tasksEnum.ADVANCE_CLAIM_EVIDENCE_REMINDER_NOTIFICATION)
      expect(mockInsertTask.mock.calls[0][4]).toBe(`${CLAIMS_WITH_EMAIL[0].EmailAddress}~~${reminderEnum.FIRST}`)
      expect(mockInsertTask.mock.calls[2][0]).toBe(CLAIMS_WITH_EMAIL[0].Reference)
      expect(mockInsertTask.mock.calls[2][3]).toBe(tasksEnum.ADVANCE_CLAIM_EVIDENCE_REMINDER_NOTIFICATION)
      expect(mockInsertTask.mock.calls[2][4]).toBe(`${CLAIMS_WITH_EMAIL[0].EmailAddress}~~${reminderEnum.SECOND}`)
    })
  })
})
