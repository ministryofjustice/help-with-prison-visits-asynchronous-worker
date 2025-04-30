const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const updateVisitorWithDwpBenefitCheckerResult = require('../../../../app/services/data/update-visitor-with-dwp-benefit-checker-result')

describe('services/data/update-visitor-with-dwp-benefit-checker-result', () => {
  const reference = 'DWPVIST'
  const dwpBenefitCheckerResult = 'YES'
  let visitorId

  beforeAll(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', reference).then(() => {
      const db = getDatabaseConnector()

      return db('IntSchema.Visitor')
        .where('Reference', reference)
        .first('VisitorId')
        .then(visitor => {
          visitorId = visitor.VisitorId
        })
    })
  })

  it('should update internal Visitor with DWP benefit checker result ', () => {
    return updateVisitorWithDwpBenefitCheckerResult(visitorId, dwpBenefitCheckerResult, null).then(() => {
      const db = getDatabaseConnector()

      return db('IntSchema.Visitor')
        .where('Reference', reference)
        .first('DWPBenefitCheckerResult')
        .then(visitor => {
          expect(visitor.DWPBenefitCheckerResult).toBe(dwpBenefitCheckerResult)
        })
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
