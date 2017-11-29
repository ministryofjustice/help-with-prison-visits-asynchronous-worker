const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')

const updateVisitorWithDwpBenefitCheckerResult = require('../../../../app/services/data/update-visitor-with-dwp-benefit-checker-result')

describe('services/data/update-visitor-with-dwp-benefit-checker-result', function () {
  var reference = 'DWPVIST'
  var dwpBenefitCheckerResult = 'YES'
  var visitorId

  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function () {
        return knex('IntSchema.Visitor').where('Reference', reference).first('VisitorId')
          .then(function (visitor) {
            visitorId = visitor.VisitorId
          })
      })
  })

  it('should update internal Visitor with DWP benefit checker result ', function () {
    return updateVisitorWithDwpBenefitCheckerResult(visitorId, dwpBenefitCheckerResult, null)
      .then(function () {
        return knex('IntSchema.Visitor').where('Reference', reference).first('DWPBenefitCheckerResult')
          .then(function (visitor) {
            expect(visitor.DWPBenefitCheckerResult).to.be.equal(dwpBenefitCheckerResult)
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
