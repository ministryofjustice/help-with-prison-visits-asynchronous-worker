const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')

const updateVisitorWithDwpBenefitCheckerResult = require('../../../../app/services/data/update-visitor-with-dwp-benefit-checker-result')

describe('services/data/update-visitor-with-dwp-benefit-checker-result', function () {
  var reference = 'DWPVISI'
  var dwpBenefitCheckerResult = 'YES'
  var visitorId

  beforeEach(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function () {
        return knex('IntSchema.Eligibility').where('Reference', reference)
        .join('IntSchema.Visitor', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
        .first('VisitorId')
        .then(function (result) {
          visitorId = result.VisitorId
        })
      })
  })

  it('should update internal Visitor with DWP benefit checker result ', function () {
    return updateVisitorWithDwpBenefitCheckerResult(visitorId, dwpBenefitCheckerResult)
      .then(function () {
        return knex('IntSchema.Visitor').where('VisitorId', visitorId).first()
          .then(function (visitor) {
            expect(visitor.DWPBenefitCheckerResult).to.be.equal(dwpBenefitCheckerResult)
          })
      })
  })

  after(function () {
    return testHelper.deleteAllInternalClaimEligibilityData(reference)
  })
})
