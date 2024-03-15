const proxyquire = require('proxyquire')
let mockGetAllClaimData
let mockCallDistanceApiForPostcodes
let mockUpdateExpenseForDistanceCalculation
let mockGetAutoApprovalConfig

let calculateCarExpenseCosts

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

jest.mock('../../../config', () => ({
  DISTANCE_CALCULATION_ENABLED: 'true',
  DISTANCE_CALCULATION_MAX_MILES: '750'
}))

jest.mock('../data/get-all-claim-data', () => mockGetAllClaimData)
jest.mock('./call-distance-api-for-postcodes', () => mockCallDistanceApiForPostcodes)

jest.mock(
  '../data/update-expense-for-distance-calculation',
  () => mockUpdateExpenseForDistanceCalculation
)

jest.mock('../data/get-auto-approval-config', () => mockGetAutoApprovalConfig)

describe.skip('services/distance-checker/calculate-car-expense-costs', function () {
  beforeEach(function () {
    mockGetAllClaimData = jest.fn()
    mockCallDistanceApiForPostcodes = jest.fn().mockResolvedValue(10.0)
    mockUpdateExpenseForDistanceCalculation = jest.fn().mockResolvedValue()
    mockGetAutoApprovalConfig = jest.fn().mockResolvedValue({ CostPerMile: '13.00' })

    calculateCarExpenseCosts = require('../../../../app/services/distance-checker/calculate-car-expense-costs')
  })

  it('should not call if config is disabled', function () {
    const calculateCarExpenseCostsConfigDisabled = proxyquire('../../../../app/services/distance-checker/calculate-car-expense-costs', { '../../../config': { DISTANCE_CALCULATION_ENABLED: 'false' } })
    return calculateCarExpenseCostsConfigDisabled(REFERENCE, ELIGIBILITY_ID, CLAIM_ID, CLAIM_DATA_WITH_CAR_EXPENSE)
      .then(function () {
        expect(mockCallDistanceApiForPostcodes).not.toHaveBeenCalled() //eslint-disable-line
      })
  })

  it('should not call if no car expense', function () {
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_WITH_NO_CAR_EXPENSE)

    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(mockCallDistanceApiForPostcodes).not.toHaveBeenCalled() //eslint-disable-line
      })
  })

  it('should call distance API and update claim for car expense', function () {
    const COST = 80.78
    const DISTANCE = 6.21371
    const distanceInKm = 10.0

    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_WITH_CAR_EXPENSE)
    mockCallDistanceApiForPostcodes.mockResolvedValue(distanceInKm)
    mockUpdateExpenseForDistanceCalculation.mockResolvedValue()

    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(mockCallDistanceApiForPostcodes).toHaveBeenCalledWith(VISITOR_POSTCODE, PRISON_POSTCODE).toBe(true) //eslint-disable-line
        expect(mockGetAutoApprovalConfig).toHaveBeenCalled() //eslint-disable-line
        expect(mockUpdateExpenseForDistanceCalculation).toHaveBeenCalledWith(CAR_EXPENSE_ID, VISITOR_POSTCODE, PRISON_POSTCODE, DISTANCE, COST).toBe(true) //eslint-disable-line
      })
  })

  it('should not set cost if distance over max', function () {
    const DISTANCE = 776.71375
    const distanceInKm = 1250

    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_WITH_CAR_EXPENSE)
    mockCallDistanceApiForPostcodes.mockResolvedValue(distanceInKm)
    mockUpdateExpenseForDistanceCalculation.mockResolvedValue()

    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(mockUpdateExpenseForDistanceCalculation).toHaveBeenCalledWith(CAR_EXPENSE_ID, VISITOR_POSTCODE, PRISON_POSTCODE, DISTANCE, 0.0).toBe(true) //eslint-disable-line
      })
  })

  it('should use existing car expense to/from postcodes', function () {
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_WITH_NO_ELIGIBILITY_DATA)
    mockCallDistanceApiForPostcodes.mockResolvedValue(20.0)
    mockUpdateExpenseForDistanceCalculation.mockResolvedValue()

    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(mockCallDistanceApiForPostcodes).toHaveBeenCalledWith(CLAIM_DATA_WITH_NO_ELIGIBILITY_DATA.ClaimExpenses[0].FromPostCode, CLAIM_DATA_WITH_NO_ELIGIBILITY_DATA.ClaimExpenses[0].ToPostCode).toBe(true) //eslint-disable-line
      })
  })

  it('should resolve without calling distance checker if no claim expenses', function () {
    mockGetAllClaimData.mockResolvedValue({})
    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(mockCallDistanceApiForPostcodes).not.toHaveBeenCalled() //eslint-disable-line
      })
  })

  it('should resolve without calling distance checker if no postcodes', function () {
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_WITH_NO_ELIGIBILITY_OR_POSTCODES)
    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(mockCallDistanceApiForPostcodes).not.toHaveBeenCalled() //eslint-disable-line
      })
  })

  it('should resolve without calling distance checker if prison incorrect', function () {
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_WITH_INCORRECT_PRISON)
    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(mockCallDistanceApiForPostcodes).not.toHaveBeenCalled() //eslint-disable-line
      })
  })

  it('should return distance in miles to be null if no distance in km calculated', function () {
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_WITH_CAR_EXPENSE)
    mockCallDistanceApiForPostcodes.mockResolvedValue()
    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID)
      .then(function () {
        expect(mockCallDistanceApiForPostcodes).toHaveBeenCalledWith(VISITOR_POSTCODE, PRISON_POSTCODE).toBe(true) //eslint-disable-line
        expect(mockUpdateExpenseForDistanceCalculation).toHaveBeenCalledWith(CAR_EXPENSE_ID, VISITOR_POSTCODE, PRISON_POSTCODE, null, 0.0).toBe(true) //eslint-disable-line
      })
  })
})
