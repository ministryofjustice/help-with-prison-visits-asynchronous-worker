const expect = require('chai').expect
const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const getClaimDocuments = require('../../../../app/services/data/get-claim-documents')
const testHelper = require('../../../test-helper')

const REFERENCE = 'GETDOCS'
let eligibilityId
let claimId
let expectedCount

describe('services/data/get-claim-documents', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        const db = getDatabaseConnector()

        eligibilityId = ids.eligibilityId
        claimId = ids.claimId

        return db.table('IntSchema.ClaimDocument').where({ Reference: REFERENCE }).select()
          .then(function (claimDocuments) {
            expectedCount = claimDocuments.length
          })
      })
  })
  it('should get the claim documents', function () {
    return getClaimDocuments('IntSchema', REFERENCE, eligibilityId, claimId)
      .then(function (claimDocuments) {
        expect(claimDocuments.length).to.equal(expectedCount)
        expect(claimDocuments[0].IsEnabled).to.be.true //eslint-disable-line
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
