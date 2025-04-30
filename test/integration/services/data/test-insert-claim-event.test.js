const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const insertClaimEvent = require('../../../../app/services/data/insert-claim-event')
const testHelper = require('../../../test-helper')

const REFERENCE = 'EVENT458'
const event = 'TEST'

let claimId
let eligibilityId

describe('services/data/insert-claim-event', () => {
  beforeAll(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE).then(ids => {
      claimId = ids.claimId
      eligibilityId = ids.eligibilityId
    })
  })
  it('should create a Claim Event', () => {
    return insertClaimEvent(REFERENCE, eligibilityId, claimId, null, event, null, null, true).then(() => {
      const db = getDatabaseConnector()

      return db
        .table('IntSchema.ClaimEvent')
        .where({ Reference: REFERENCE, EligibilityId: eligibilityId, ClaimId: claimId })
        .first()
        .then(result => {
          expect(result.Event).toBe(event)
          expect(result.IsInternal).toBe(true)
          expect(result.DateSubmitted).not.toBeNull()
        })
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
