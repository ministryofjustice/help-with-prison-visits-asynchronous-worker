const expect = require('chai').expect
const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const updateVisitorWithDwpBenefitCheckerResult = require('../../../../app/services/data/update-visitor-with-dwp-benefit-checker-result')

describe('services/data/update-visitor-with-dwp-benefit-checker-result', function () {
  const reference = 'DWPVIST'
  const dwpBenefitCheckerResult = 'YES'
  let visitorId

  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function () {
        const db = getDatabaseConnector()

        return db('IntSchema.Visitor').where('Reference', reference).first('VisitorId')
          .then(function (visitor) {
            visitorId = visitor.VisitorId
          })
      })
  })

  it('should update internal Visitor with DWP benefit checker result ', function () {
    return updateVisitorWithDwpBenefitCheckerResult(visitorId, dwpBenefitCheckerResult, null)
      .then(function () {
        const db = getDatabaseConnector()

        return db('IntSchema.Visitor').where('Reference', reference).first('DWPBenefitCheckerResult')
          .then(function (visitor) {
            expect(visitor.DWPBenefitCheckerResult).to.be.equal(dwpBenefitCheckerResult)
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
