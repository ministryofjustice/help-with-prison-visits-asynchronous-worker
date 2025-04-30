const testHelper = require('../../../test-helper')
const dateFormatter = require('../../../../app/services/date-formatter')

const getAdvanceClaimsTotalExpenseApprovedCostBeforeDate = require('../../../../app/services/data/get-advance-claims-total-expense-approved-cost-before-date')

describe('services/data/get-advance-claims-total-expense-approved-cost-before-date', () => {
  const REFERENCE = 'AMOUNTO'
  let claimId
  const date = dateFormatter.now().add('1', 'd').toDate()
  let amount

  beforeAll(() => {
    const data = testHelper.getClaimData(REFERENCE)
    amount = data.ClaimExpenses[0].ApprovedCost + data.ClaimExpenses[1].ApprovedCost
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE, 'TESTING').then(ids => {
      claimId = ids.claimId
    })
  })

  it('should get all advance claims before specifed date with status', () => {
    return getAdvanceClaimsTotalExpenseApprovedCostBeforeDate(date, 'TESTING').then(claims => {
      expect(claims[0].ClaimId).toBe(claimId)
      expect(claims[0].Reference).toBe(REFERENCE)
      expect(claims[0].Amount).toBe(amount)
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
