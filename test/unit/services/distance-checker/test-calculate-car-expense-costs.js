const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

var callDistanceApiForPostcodes
var updateExpenseForDistanceCalculation
var getAutoApprovalConfig

var calculateCarExpenseCosts

const REFERENCE = '1234567'
const ELIGIBILITY_ID = '4321'
const CLAIM_ID = 123
const VISITOR_POSTCODE = 'BT11 1BT'
const NAME_OF_PRISON = 'hewell'
const PRISON_POSTCODE = 'B97 6QS'
const CAR_EXPENSE_ID = 321
const BUS_EXPENSE_ID = 322
const CAR_EXPENSE = { ClaimExpenseId: CAR_EXPENSE_ID, ExpenseType: 'car', Cost: '0.00' }
const BUS_EXPENSE = { ClaimExpenseId: BUS_EXPENSE_ID, ExpenseType: 'bus', Cost: '10.00' }

const CLAIM_DATA_WITH_CAR_EXPENSE = { Visitor: { PostCode: VISITOR_POSTCODE }, Prisoner: { NameOfPrison: NAME_OF_PRISON }, ClaimExpenses: [CAR_EXPENSE, BUS_EXPENSE] }
const CLAIM_DATA_WITH_NO_CAR_EXPENSE = { Visitor: { PostCode: VISITOR_POSTCODE }, Prisoner: { NameOfPrison: NAME_OF_PRISON }, ClaimExpenses: [BUS_EXPENSE] }

describe('services/distance-checker/calculate-car-expense-costs', function () {
  beforeEach(function () {
    callDistanceApiForPostcodes = sinon.stub().resolves(10.0)
    updateExpenseForDistanceCalculation = sinon.stub().resolves()
    getAutoApprovalConfig = sinon.stub().resolves({CostPerMile: '13.00'})

    calculateCarExpenseCosts = proxyquire('../../../../app/services/distance-checker/calculate-car-expense-costs', {
      '../../../config': { DISTANCE_CALCULATION_ENABLED: 'true' },
      './call-distance-api-for-postcodes': callDistanceApiForPostcodes,
      '../data/update-expense-for-distance-calculation': updateExpenseForDistanceCalculation,
      '../data/get-auto-approval-config': getAutoApprovalConfig
    })
  })

  it('should not call if config is disabled', function () {
    var calculateCarExpenseCostsConfigDisabled = proxyquire('../../../../app/services/distance-checker/calculate-car-expense-costs', { '../../../config': { DISTANCE_CALCULATION_ENABLED: 'false' } })
    return calculateCarExpenseCostsConfigDisabled(REFERENCE, ELIGIBILITY_ID, CLAIM_ID, CLAIM_DATA_WITH_CAR_EXPENSE)
      .then(function () {
        expect(callDistanceApiForPostcodes.called).to.be.false
      })
  })

  it('should not call if no car expense', function () {
    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID, CLAIM_DATA_WITH_NO_CAR_EXPENSE)
      .then(function () {
        expect(callDistanceApiForPostcodes.called).to.be.false
      })
  })

  it('should call distance API and update claim for car expense', function () {
    const COST = 80.78
    const DISTANCE = 6.21371
    var distanceInKm = 10.0

    callDistanceApiForPostcodes.resolves(distanceInKm)
    updateExpenseForDistanceCalculation.resolves()

    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID, CLAIM_DATA_WITH_CAR_EXPENSE)
      .then(function () {
        expect(callDistanceApiForPostcodes.calledWith(VISITOR_POSTCODE, PRISON_POSTCODE)).to.be.true
        expect(getAutoApprovalConfig.called).to.be.true
        expect(updateExpenseForDistanceCalculation.calledWith(CAR_EXPENSE_ID, VISITOR_POSTCODE, PRISON_POSTCODE, DISTANCE, COST)).to.be.true
      })
  })
})
