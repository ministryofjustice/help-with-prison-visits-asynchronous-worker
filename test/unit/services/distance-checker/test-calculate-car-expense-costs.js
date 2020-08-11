const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')

var getAllClaimData
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

const CAR_EXPENSE = { ClaimExpenseId: CAR_EXPENSE_ID, To: NAME_OF_PRISON, ExpenseType: 'car', Cost: 0.0 }
const BUS_EXPENSE = { ClaimExpenseId: BUS_EXPENSE_ID, ExpenseType: 'bus', Cost: 10.00 }
const CAR_EXPENSE_ALREADY_CALCULATED = { ClaimExpenseId: CAR_EXPENSE_ID, ExpenseType: 'car', Cost: 0.0, FromPostCode: 'FR111FR', ToPostCode: 'TO111TO' }

const CLAIM_DATA_WITH_CAR_EXPENSE = { Visitor: { PostCode: VISITOR_POSTCODE }, Prisoner: { NameOfPrison: NAME_OF_PRISON }, ClaimExpenses: [CAR_EXPENSE, BUS_EXPENSE] }
const CLAIM_DATA_WITH_NO_CAR_EXPENSE = { Visitor: { PostCode: VISITOR_POSTCODE }, Prisoner: { NameOfPrison: NAME_OF_PRISON }, ClaimExpenses: [BUS_EXPENSE] }
const CLAIM_DATA_WITH_NO_ELIGIBILITY_DATA = { ClaimExpenses: [CAR_EXPENSE_ALREADY_CALCULATED] }
const CLAIM_DATA_WITH_NO_ELIGIBILITY_OR_POSTCODES = { ClaimExpenses: [CAR_EXPENSE] }
const CLAIM_DATA_WITH_INCORRECT_PRISON = { Visitor: { PostCode: VISITOR_POSTCODE }, Prisoner: { NameOfPrison: 'test' }, ClaimExpenses: [CAR_EXPENSE, BUS_EXPENSE] }

describe('services/distance-checker/calculate-car-expense-costs', function () {
  beforeEach(function () {
    getAllClaimData = sinon.stub()
    callDistanceApiForPostcodes = sinon.stub().resolves(10.0)
    updateExpenseForDistanceCalculation = sinon.stub().resolves()
    getAutoApprovalConfig = sinon.stub().resolves({ CostPerMile: '13.00' })

    calculateCarExpenseCosts = proxyquire('../../../../app/services/distance-checker/calculate-car-expense-costs', {
      '../../../config': { DISTANCE_CALCULATION_ENABLED: 'true', DISTANCE_CALCULATION_MAX_MILES: '750' },
      '../data/get-all-claim-data': getAllClaimData,
      './call-distance-api-for-postcodes': callDistanceApiForPostcodes,
      '../data/update-expense-for-distance-calculation': updateExpenseForDistanceCalculation,
      '../data/get-auto-approval-config': getAutoApprovalConfig
    })
  })

  it('should not call if config is disabled', function () {
    var calculateCarExpenseCostsConfigDisabled = proxyquire('../../../../app/services/distance-checker/calculate-car-expense-costs', { '../../../config': { DISTANCE_CALCULATION_ENABLED: 'false' } })
    return calculateCarExpenseCostsConfigDisabled(REFERENCE, ELIGIBILITY_ID, CLAIM_ID, CLAIM_DATA_WITH_CAR_EXPENSE)
      .then(function () {
        expect(callDistanceApiForPostcodes.called).to.be.false //eslint-disable-line
      })
  })

  it('should not call if no car expense', function () {
    getAllClaimData.resolves(CLAIM_DATA_WITH_NO_CAR_EXPENSE)

    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(callDistanceApiForPostcodes.called).to.be.false //eslint-disable-line
      })
  })

  it('should call distance API and update claim for car expense', function () {
    const COST = 80.78
    const DISTANCE = 6.21371
    var distanceInKm = 10.0

    getAllClaimData.resolves(CLAIM_DATA_WITH_CAR_EXPENSE)
    callDistanceApiForPostcodes.resolves(distanceInKm)
    updateExpenseForDistanceCalculation.resolves()

    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(callDistanceApiForPostcodes.calledWith(VISITOR_POSTCODE, PRISON_POSTCODE)).to.be.true //eslint-disable-line
        expect(getAutoApprovalConfig.called).to.be.true //eslint-disable-line
        expect(updateExpenseForDistanceCalculation.calledWith(CAR_EXPENSE_ID, VISITOR_POSTCODE, PRISON_POSTCODE, DISTANCE, COST)).to.be.true //eslint-disable-line
      })
  })

  it('should not set cost if distance over max', function () {
    const DISTANCE = 776.71375
    var distanceInKm = 1250

    getAllClaimData.resolves(CLAIM_DATA_WITH_CAR_EXPENSE)
    callDistanceApiForPostcodes.resolves(distanceInKm)
    updateExpenseForDistanceCalculation.resolves()

    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(updateExpenseForDistanceCalculation.calledWith(CAR_EXPENSE_ID, VISITOR_POSTCODE, PRISON_POSTCODE, DISTANCE, 0.0)).to.be.true //eslint-disable-line
      })
  })

  it('should use existing car expense to/from postcodes', function () {
    getAllClaimData.resolves(CLAIM_DATA_WITH_NO_ELIGIBILITY_DATA)
    callDistanceApiForPostcodes.resolves(20.0)
    updateExpenseForDistanceCalculation.resolves()

    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(callDistanceApiForPostcodes.calledWith(CLAIM_DATA_WITH_NO_ELIGIBILITY_DATA.ClaimExpenses[0].FromPostCode, CLAIM_DATA_WITH_NO_ELIGIBILITY_DATA.ClaimExpenses[0].ToPostCode)).to.be.true //eslint-disable-line
      })
  })

  it('should resolve without calling distance checker if no claim expenses', function () {
    getAllClaimData.resolves({})
    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(callDistanceApiForPostcodes.called).to.be.false //eslint-disable-line
      })
  })

  it('should resolve without calling distance checker if no postcodes', function () {
    getAllClaimData.resolves(CLAIM_DATA_WITH_NO_ELIGIBILITY_OR_POSTCODES)
    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(callDistanceApiForPostcodes.called).to.be.false //eslint-disable-line
      })
  })

  it('should resolve without calling distance checker if prison incorrect', function () {
    getAllClaimData.resolves(CLAIM_DATA_WITH_INCORRECT_PRISON)
    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(callDistanceApiForPostcodes.called).to.be.false //eslint-disable-line
      })
  })

  it('should return distance in miles to be null if no distance in km calculated', function () {
    getAllClaimData.resolves(CLAIM_DATA_WITH_CAR_EXPENSE)
    callDistanceApiForPostcodes.resolves()
    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(callDistanceApiForPostcodes.calledWith(VISITOR_POSTCODE, PRISON_POSTCODE)).to.be.true //eslint-disable-line
        expect(updateExpenseForDistanceCalculation.calledWith(CAR_EXPENSE_ID, VISITOR_POSTCODE, PRISON_POSTCODE, null, 0.0)).to.be.true //eslint-disable-line
      })
  })
})
