const sinon = require('sinon')
const dateFormatter = require('../../../../app/services/date-formatter')

const CLAIM_ID_1 = 1
const CLAIM_ID_2 = 2

const config = { ARCHIVE_CLAIMS_AFTER_DAYS: '10' }
const tenDaysAgo = dateFormatter.now().subtract(10, 'day')
const tenDaysAgoMinus5mins = tenDaysAgo.subtract(5, 'minute').toDate()
const tenDaysAgoPlus5mins = tenDaysAgo.add(10, 'minute').toDate()

let getAllClaimsOlderThanDate
let insertTask

let archiveOldClaims

jest.mock('../../../config', () => config);
jest.mock('../data/get-all-claims-older-than-date', () => getAllClaimsOlderThanDate);
jest.mock('../data/insert-task', () => insertTask);

describe('services/workers/archive-old-claims', function () {
  beforeEach(function () {
    getAllClaimsOlderThanDate = sinon.stub()
    insertTask = sinon.stub()

    archiveOldClaims = require('../../../../app/services/workers/archive-old-claims')
  })

  it('should retrieve all claims older than current date minus config days', function () {
    getAllClaimsOlderThanDate.resolves([])

    return archiveOldClaims.execute({}).then(function () {
      expect(getAllClaimsOlderThanDate.calledOnce).toBe(true) //eslint-disable-line
      expect(getAllClaimsOlderThanDate.firstCall.args[0]).toBeGreaterThanOrEqual(tenDaysAgoMinus5mins);
      expect(getAllClaimsOlderThanDate.firstCall.args[0]).toBeLessThanOrEqual(tenDaysAgoPlus5mins)
    });
  })

  it('should insert an archive claim task for each claim id found', function () {
    getAllClaimsOlderThanDate.resolves([CLAIM_ID_1, CLAIM_ID_2])
    insertTask.resolves()

    return archiveOldClaims.execute({}).then(function () {
      expect(insertTask.calledTwice).toBe(true) //eslint-disable-line
    });
  })
})
