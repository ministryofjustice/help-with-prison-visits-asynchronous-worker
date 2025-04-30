const log = require('../log')
const config = require('../../../config')
const callDistanceApiForPostcodes = require('./call-distance-api-for-postcodes')
const updateExpenseForDistanceCalculation = require('../data/update-expense-for-distance-calculation')
const getAutoApprovalConfig = require('../data/get-auto-approval-config')
const getAllClaimData = require('../data/get-all-claim-data')
const prisonsEnum = require('../../constants/prisons-enum')
const enumHelper = require('../../constants/helpers/enum-helper')

const KILOMETERS_TO_MILES = 0.621371

module.exports = (reference, eligibilityId, claimId) => {
  log.info(`calculate-car-expense-costs DISTANCE_CALCULATION_ENABLED: ${config.DISTANCE_CALCULATION_ENABLED}`)

  if (config.DISTANCE_CALCULATION_ENABLED !== 'true') {
    return Promise.resolve()
  }

  return getAllClaimData('IntSchema', reference, eligibilityId, claimId).then(claimData => {
    const carExpenses = getUncalculatedCarExpenses(claimData)

    if (carExpenses.length > 0) {
      const promises = []

      carExpenses.forEach(carExpense => {
        promises.push(calculateCarExpenseCost(carExpense, claimData))
      })

      return Promise.all(promises)
    }
    return Promise.resolve()
  })
}

function calculateCarExpenseCost(carExpense, claimData) {
  const visitorPostCode = claimData.Visitor ? claimData.Visitor.PostCode : null
  const fromPostCode = carExpense.FromPostCode ? carExpense.FromPostCode : visitorPostCode
  const claimPrisoner = claimData.Prisoner ? getPrisonPostCode(claimData.Prisoner.NameOfPrison) : null
  let toPostCode = carExpense.ToPostCode ? carExpense.ToPostCode : claimPrisoner

  if (claimData.Prisoner && carExpense.To !== claimData.Prisoner.NameOfPrison && !carExpense.ToPostCode) {
    toPostCode = null
  }

  if (fromPostCode && toPostCode) {
    return getDistanceInMilesAndCost(fromPostCode, toPostCode, claimData.Visitor.Country).then(result => {
      let { cost } = result
      const { distanceInMiles } = result

      if (distanceInMiles > parseFloat(config.DISTANCE_CALCULATION_MAX_MILES)) {
        cost = 0.0
      }

      return updateExpenseForDistanceCalculation(
        carExpense.ClaimExpenseId,
        fromPostCode,
        toPostCode,
        distanceInMiles,
        cost,
      )
    })
  }
  return Promise.resolve()
}

function getUncalculatedCarExpenses(claimData) {
  return claimData.ClaimExpenses
    ? claimData.ClaimExpenses.filter(expense => {
        return expense.ExpenseType === 'car' && expense.Cost === 0
      })
    : []
}

function getPrisonPostCode(nameOfPrison) {
  const prison = enumHelper.getKeyByValue(prisonsEnum, nameOfPrison)
  return prison ? prison.postcode : null
}

function getDistanceInMilesAndCost(visitorPostCode, prisonPostCode, country) {
  return callDistanceApiForPostcodes(visitorPostCode, prisonPostCode).then(distanceInKm => {
    let cost = 0.0
    let distanceInMiles = null

    if (distanceInKm) {
      distanceInMiles = distanceInKm * KILOMETERS_TO_MILES
      return getAutoApprovalConfig().then(autoApprovalConfig => {
        let costPerMile = parseFloat(autoApprovalConfig.CostPerMile)

        switch (country) {
          case 'England':
          case 'Wales':
            costPerMile = parseFloat(autoApprovalConfig.CostPerMileEngWal)
            break
          default:
        }

        cost = Number(`${Math.round(`${distanceInMiles * costPerMile}e2`)}e-2`) // accurate 2 decimal place rounding

        return { cost, distanceInMiles }
      })
    }
    return { cost, distanceInMiles }
  })
}
