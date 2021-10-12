const expect = require('chai').expect
const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const disableClaimDocument = require('../../../../app/services/data/disable-claim-document')
const testHelper = require('../../../test-helper')

const REFERENCE = 'DISDOC1'
let claimDocumentId

describe('services/data/disable-claim-document', function () {
  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function () {
        const db = getDatabaseConnector()

        return db.table('IntSchema.ClaimDocument').where({ Reference: REFERENCE }).first()
          .then(function (claimDocument) {
            claimDocumentId = claimDocument.ClaimDocumentId
          })
      })
  })
  it('should disable the claim document', function () {
    return disableClaimDocument('IntSchema', claimDocumentId)
      .then(function () {
        const db = getDatabaseConnector()

        return db.table('IntSchema.ClaimDocument')
          .where({ ClaimDocumentId: claimDocumentId })
          .first()
          .then(function (result) {
            expect(result.IsEnabled).to.be.false //eslint-disable-line
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
