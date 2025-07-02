const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')
const dateFormatter = require('../../../../app/services/date-formatter')

const completeTaskWithStatus = require('../../../../app/services/data/complete-task-with-status')

describe('services/data/complete-task-with-status', () => {
  const newStatus = 'NEWSTAT'
  let id

  beforeAll(() => {
    const db = getDatabaseConnector()

    return db('ExtSchema.Task')
      .insert(testHelper.getTaskObject('TEST-TASK', null, 'TEST'))
      .returning('TaskId')
      .then(taskId => {
        id = taskId[0].TaskId
      })
  })

  it('should set status and set DateProcessed', () => {
    return completeTaskWithStatus('ExtSchema', id, newStatus).then(() => {
      const db = getDatabaseConnector()

      return db
        .first()
        .table('ExtSchema.Task')
        .where('TaskId', id)
        .then(result => {
          const currentDate = dateFormatter.now()
          const twoMinutesAgo = dateFormatter.now().minutes(currentDate.get('minutes') - 2)
          const twoMinutesAhead = dateFormatter.now().minutes(currentDate.get('minutes') + 2)
          expect(result.Status).toBe(newStatus)
          expect(result.DateProcessed).toBeGreaterThanOrEqual(twoMinutesAgo.toDate())
          expect(result.DateProcessed).toBeLessThanOrEqual(twoMinutesAhead.toDate())
        })
    })
  })

  afterAll(() => {
    const db = getDatabaseConnector()

    return db('ExtSchema.Task').where('Task', 'TEST-TASK').del()
  })
})
