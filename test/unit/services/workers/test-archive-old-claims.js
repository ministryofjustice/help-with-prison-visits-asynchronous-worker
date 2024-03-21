const dateFormatter = require('../../../../app/services/date-formatter')
const CLAIM_ID_1 = 1
const CLAIM_ID_2 = 2
const tenDaysAgo = dateFormatter.now().subtract(10, 'day')
const tenDaysAgoMinus5mins = tenDaysAgo.subtract(5, 'minute').toDate().getTime()
const tenDaysAgoPlus5mins = tenDaysAgo.add(10, 'minute').toDate().getTime()

const mockConfig = { ARCHIVE_CLAIMS_AFTER_DAYS: '10' }
const mockGetAllClaimsOlderThanDate = jest.fn()
const mockInsertTask = jest.fn()
let archiveOldClaims

describe('services/workers/archive-old-claims', () => {
  beforeEach(() => {
    jest.mock('../../../../config', () => mockConfig)
    jest.mock('../../../../app/services/data/insert-task', () => mockInsertTask)
    jest.mock('../../../../app/services/data/get-all-claims-older-than-date', () => mockGetAllClaimsOlderThanDate)

    archiveOldClaims = require('../../../../app/services/workers/archive-old-claims')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should retrieve all claims older than current date minus config days', () => {
    mockGetAllClaimsOlderThanDate.mockReturnValue(Promise.resolve([]))
    mockInsertTask.mockReturnValue(Promise.resolve())

    return archiveOldClaims.execute({}).then(() => {
      expect(mockGetAllClaimsOlderThanDate).toHaveBeenCalledTimes(1) //eslint-disable-line
      expect(mockGetAllClaimsOlderThanDate.mock.calls[0][0].getTime()).toBeGreaterThanOrEqual(tenDaysAgoMinus5mins)
      expect(mockGetAllClaimsOlderThanDate.mock.calls[0][0].getTime()).toBeLessThanOrEqual(tenDaysAgoPlus5mins)
    })
  })

  it('should insert an archive claim task for each claim id found', () => {
    mockGetAllClaimsOlderThanDate.mockReturnValue(Promise.resolve([CLAIM_ID_1, CLAIM_ID_2]))
    mockInsertTask.mockReturnValue(Promise.resolve())

    return archiveOldClaims.execute({}).then(() => {
      expect(mockInsertTask).toHaveBeenCalledTimes(2) //eslint-disable-line
    })
  })
})
