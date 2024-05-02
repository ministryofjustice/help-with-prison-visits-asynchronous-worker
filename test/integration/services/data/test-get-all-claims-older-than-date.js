const dateFormatter = require('../../../../app/services/date-formatter')
const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const getAllClaimsOldersThanDate = require('../../../../app/services/data/get-all-claims-older-than-date')

const REFERENCE = 'OLDCLMS'

let claimId
let eligibilityId
let claim2
let claim3
const olderThanDate = dateFormatter.now().subtract(365, 'days').toDate()

describe('services/data/get-all-claims-older-than-date', function () {
  beforeAll(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE).then(function (ids) {
      claimId = ids.claimId
      eligibilityId = ids.eligibilityId

      claim2 = testHelper.getClaimData(REFERENCE).Claim
      claim2.EligibilityId = eligibilityId
      claim2.ClaimId = claimId + 1
      claim2.DateReviewed = dateFormatter.now().subtract(366, 'days').toDate()
      claim2.Status = 'APPROVED'

      claim3 = testHelper.getClaimData(REFERENCE).Claim
      claim3.EligibilityId = eligibilityId
      claim3.ClaimId = claimId + 2
      claim3.DateReviewed = dateFormatter.now().subtract(370, 'days').toDate()
      claim3.Status = 'APPROVED'

      const db = getDatabaseConnector()

      return Promise.all([db('IntSchema.Claim').insert(claim2), db('IntSchema.Claim').insert(claim3)])
    })
  })

  it('should return claims with date reviewed older than date', function () {
    return getAllClaimsOldersThanDate(olderThanDate).then(function (claimIds) {
      const expectedClaimIds = claimIds.filter(function (result) {
        // filter to remove old test claims
        return result.ClaimId === claim2.ClaimId || result.ClaimId === claim3.ClaimId
      })

      expect(expectedClaimIds.length).toBe(2)
    })
  })

  afterAll(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
