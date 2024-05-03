const REFERENCE = '1234567'
const ELIGIBILITY_ID = '4321'
const CLAIM_ID = 123
const VISITOR_POSTCODE = 'BT11 1BT'
const NAME_OF_PRISON = 'hewell'
const PRISON_POSTCODE = 'B97 6QS'

const CAR_EXPENSE_ID = 321
const BUS_EXPENSE_ID = 322

const CAR_EXPENSE = { ClaimExpenseId: CAR_EXPENSE_ID, To: NAME_OF_PRISON, ExpenseType: 'car', Cost: 0.0 }
const BUS_EXPENSE = { ClaimExpenseId: BUS_EXPENSE_ID, ExpenseType: 'bus', Cost: 10.0 }
const CAR_EXPENSE_ALREADY_CALCULATED = {
  ClaimExpenseId: CAR_EXPENSE_ID,
  ExpenseType: 'car',
  Cost: 0.0,
  FromPostCode: 'FR111FR',
  ToPostCode: 'TO111TO',
}

const CLAIM_DATA_WITH_CAR_EXPENSE = {
  Visitor: { Country: 'Scotland', PostCode: VISITOR_POSTCODE },
  Prisoner: { NameOfPrison: NAME_OF_PRISON },
  ClaimExpenses: [CAR_EXPENSE, BUS_EXPENSE],
}
const CLAIM_DATA_WITH_NO_CAR_EXPENSE = {
  Visitor: { PostCode: VISITOR_POSTCODE },
  Prisoner: { NameOfPrison: NAME_OF_PRISON },
  ClaimExpenses: [BUS_EXPENSE],
}
const CLAIM_DATA_WITH_NO_ELIGIBILITY_DATA = {
  ClaimExpenses: [CAR_EXPENSE_ALREADY_CALCULATED],
  Visitor: { Country: 'England' },
}
const CLAIM_DATA_WITH_NO_ELIGIBILITY_OR_POSTCODES = { ClaimExpenses: [CAR_EXPENSE] }
const CLAIM_DATA_WITH_INCORRECT_PRISON = {
  Visitor: { PostCode: VISITOR_POSTCODE },
  Prisoner: { NameOfPrison: 'test' },
  ClaimExpenses: [CAR_EXPENSE, BUS_EXPENSE],
}

const mockGetAllClaimData = jest.fn()
const mockCallDistanceApiForPostcodes = jest.fn()
const mockUpdateExpenseForDistanceCalculation = jest.fn()
const mockGetAutoApprovalConfig = jest.fn()

let calculateCarExpenseCosts

describe('services/distance-checker/calculate-car-expense-costs', function () {
  beforeEach(function () {
    mockCallDistanceApiForPostcodes.mockResolvedValue(10.0)
    mockGetAllClaimData.mockResolvedValue()
    mockUpdateExpenseForDistanceCalculation.mockResolvedValue()
    mockGetAutoApprovalConfig.mockResolvedValue({ CostPerMile: '13.00', CostPerMileEngWal: '20.00' })

    jest.mock('../../../../config', () => ({
      DISTANCE_CALCULATION_ENABLED: 'true',
      DISTANCE_CALCULATION_MAX_MILES: '750',
    }))
    jest.mock('../../../../app/services/data/get-all-claim-data', () => mockGetAllClaimData)
    jest.mock(
      '../../../../app/services/distance-checker/call-distance-api-for-postcodes',
      () => mockCallDistanceApiForPostcodes,
    )
    jest.mock(
      '../../../../app/services/data/update-expense-for-distance-calculation',
      () => mockUpdateExpenseForDistanceCalculation,
    )
    jest.mock('../../../../app/services/data/get-auto-approval-config', () => mockGetAutoApprovalConfig)

    calculateCarExpenseCosts = require('../../../../app/services/distance-checker/calculate-car-expense-costs')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should not call if config is disabled', function () {
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_WITH_NO_CAR_EXPENSE)

    jest.mock('../../../../config', () => ({ DISTANCE_CALCULATION_ENABLED: 'false' }))

    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID, CLAIM_DATA_WITH_CAR_EXPENSE).then(function () {
      expect(mockCallDistanceApiForPostcodes).not.toHaveBeenCalled()
    })
  })

  it('should not call if no car expense', function () {
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_WITH_NO_CAR_EXPENSE)

    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(function () {
      expect(mockCallDistanceApiForPostcodes).not.toHaveBeenCalled()
    })
  })

  it('should call distance API and update claim for car expense', function () {
    const COST = 80.78
    const DISTANCE = 6.21371
    const distanceInKm = 10.0

    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_WITH_CAR_EXPENSE)
    mockCallDistanceApiForPostcodes.mockResolvedValue(distanceInKm)
    mockUpdateExpenseForDistanceCalculation.mockResolvedValue()

    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(function () {
      expect(mockCallDistanceApiForPostcodes).toHaveBeenCalledWith(VISITOR_POSTCODE, PRISON_POSTCODE)
      expect(mockGetAutoApprovalConfig).toHaveBeenCalled()
      expect(mockUpdateExpenseForDistanceCalculation).toHaveBeenCalledWith(
        CAR_EXPENSE_ID,
        VISITOR_POSTCODE,
        PRISON_POSTCODE,
        DISTANCE,
        COST,
      )
    })
  })

  it('should not set cost if distance over max', function () {
    const DISTANCE = 776.71375
    const distanceInKm = 1250

    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_WITH_CAR_EXPENSE)
    mockCallDistanceApiForPostcodes.mockResolvedValue(distanceInKm)
    mockUpdateExpenseForDistanceCalculation.mockResolvedValue()

    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(function () {
      expect(mockUpdateExpenseForDistanceCalculation).toHaveBeenCalledWith(
        CAR_EXPENSE_ID,
        VISITOR_POSTCODE,
        PRISON_POSTCODE,
        DISTANCE,
        0.0,
      )
    })
  })

  it('should use existing car expense to/from postcodes', function () {
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_WITH_NO_ELIGIBILITY_DATA)
    mockCallDistanceApiForPostcodes.mockResolvedValue(20.0)
    mockUpdateExpenseForDistanceCalculation.mockResolvedValue()

    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(function () {
      expect(mockCallDistanceApiForPostcodes).toHaveBeenCalledWith(
        CLAIM_DATA_WITH_NO_ELIGIBILITY_DATA.ClaimExpenses[0].FromPostCode,
        CLAIM_DATA_WITH_NO_ELIGIBILITY_DATA.ClaimExpenses[0].ToPostCode,
      )
    })
  })

  it('should resolve without calling distance checker if no claim expenses', function () {
    mockGetAllClaimData.mockResolvedValue({})
    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(function () {
      expect(mockCallDistanceApiForPostcodes).not.toHaveBeenCalled()
    })
  })

  it('should resolve without calling distance checker if no postcodes', function () {
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_WITH_NO_ELIGIBILITY_OR_POSTCODES)
    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(function () {
      expect(mockCallDistanceApiForPostcodes).not.toHaveBeenCalled()
    })
  })

  it('should resolve without calling distance checker if prison incorrect', function () {
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_WITH_INCORRECT_PRISON)
    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(function () {
      expect(mockCallDistanceApiForPostcodes).not.toHaveBeenCalled()
    })
  })

  it('should return distance in miles to be null if no distance in km calculated', function () {
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_WITH_CAR_EXPENSE)
    mockCallDistanceApiForPostcodes.mockResolvedValue()
    return calculateCarExpenseCosts(REFERENCE, ELIGIBILITY_ID, CLAIM_ID).then(function () {
      expect(mockCallDistanceApiForPostcodes).toHaveBeenCalledWith(VISITOR_POSTCODE, PRISON_POSTCODE)
      expect(mockUpdateExpenseForDistanceCalculation).toHaveBeenCalledWith(
        CAR_EXPENSE_ID,
        VISITOR_POSTCODE,
        PRISON_POSTCODE,
        null,
        0.0,
      )
    })
  })
})
