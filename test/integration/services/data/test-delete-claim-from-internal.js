const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const deleteClaimFromInternal = require('../../../../app/services/data/delete-claim-from-internal')

const REFERENCE = 'DELINTC'

let claimId
let eligibilityId

describe('services/data/delete-claim-from-internal', function () {
  beforeEach(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
        eligibilityId = ids.eligibilityId
      })
  })

  it('should delete claim and eligibility details', function () {
    return deleteClaimFromInternal(eligibilityId, claimId, true)
      .then(function () {
        const db = getDatabaseConnector()

        return db('IntSchema.Eligibility').where('EligibilityId', eligibilityId).count('EligibilityId as count')
      })
      .then(function (countResult) {
        expect(countResult[0].count).toBe(0)
      });
  })

  it('should delete claim and leave eligibility details', function () {
    return deleteClaimFromInternal(eligibilityId, claimId, false)
      .then(function () {
        const db = getDatabaseConnector()

        return db('IntSchema.Eligibility').where('EligibilityId', eligibilityId).count('EligibilityId as count')
      })
      .then(function (countResult) {
        expect(countResult[0].count).toBe(1)
      });
  })

  afterEach(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
