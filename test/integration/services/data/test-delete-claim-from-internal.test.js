const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const deleteClaimFromInternal = require('../../../../app/services/data/delete-claim-from-internal')

const REFERENCE = 'DELINTC'

let claimId
let eligibilityId

describe('services/data/delete-claim-from-internal', () => {
  beforeEach(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE).then(ids => {
      claimId = ids.claimId
      eligibilityId = ids.eligibilityId
    })
  })

  it('should delete claim and eligibility details', () => {
    return deleteClaimFromInternal(eligibilityId, claimId, true)
      .then(() => {
        const db = getDatabaseConnector()

        return db('IntSchema.Eligibility').where('EligibilityId', eligibilityId).count('EligibilityId as count')
      })
      .then(countResult => {
        expect(countResult[0].count).toBe(0)
      })
  })

  it('should delete claim and leave eligibility details', () => {
    return deleteClaimFromInternal(eligibilityId, claimId, false)
      .then(() => {
        const db = getDatabaseConnector()

        return db('IntSchema.Eligibility').where('EligibilityId', eligibilityId).count('EligibilityId as count')
      })
      .then(countResult => {
        expect(countResult[0].count).toBe(1)
      })
  })

  afterEach(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
