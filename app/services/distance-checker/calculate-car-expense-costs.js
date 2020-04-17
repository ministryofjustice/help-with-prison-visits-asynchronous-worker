const Promise = require('bluebird')
const log = require('../log')
const config = require('../../../config')
const callDistanceApiForPostcodes = require('./call-distance-api-for-postcodes')
const updateExpenseForDistanceCalculation = require('../data/update-expense-for-distance-calculation')
const getAutoApprovalConfig = require('../data/get-auto-approval-config')
const getAllClaimData = require('../data/get-all-claim-data')
const prisonsEnum = require('../../constants/prisons-enum')
const enumHelper = require('../../constants/helpers/enum-helper')

const KILOMETERS_TO_MILES = 0.621371

module.exports = function (reference, eligibilityId, claimId) {
  log.info(`calculate-car-expense-costs DISTANCE_CALCULATION_ENABLED: ${config.DISTANCE_CALCULATION_ENABLED}`)

  if (config.DISTANCE_CALCULATION_ENABLED !== 'true') {
    return Promise.resolve()
  }

  return getAllClaimData('IntSchema', reference, eligibilityId, claimId)
    .then(function (claimData) {
      var carExpenses = getUncalculatedCarExpenses(claimData)

      if (carExpenses.length > 0) {
        var promises = []

        carExpenses.forEach(function (carExpense) {
          promises.push(calculateCarExpenseCost(carExpense, claimData))
        })

        return Promise.all(promises)
      } else {
        return Promise.resolve()
      }
    })
}

function calculateCarExpenseCost (carExpense, claimData) {
  var fromPostCode = carExpense.FromPostCode ? carExpense.FromPostCode : claimData.Visitor ? claimData.Visitor.PostCode : null
  var toPostCode = carExpense.ToPostCode ? carExpense.ToPostCode : claimData.Prisoner ? getPrisonPostCode(claimData.Prisoner.NameOfPrison) : null

  if (claimData.Prisoner && carExpense.To !== claimData.Prisoner.NameOfPrison && !carExpense.ToPostCode) {
    toPostCode = null
  }

  if (fromPostCode && toPostCode) {
    return getDistanceInMilesAndCost(fromPostCode, toPostCode)
      .then(function (result) {
        var cost = result.cost
        var distanceInMiles = result.distanceInMiles

        if (distanceInMiles > parseFloat(config.DISTANCE_CALCULATION_MAX_MILES)) {
          cost = 0.0
        }

        return updateExpenseForDistanceCalculation(carExpense.ClaimExpenseId, fromPostCode, toPostCode, distanceInMiles, cost)
      })
  } else {
    return Promise.resolve()
  }
}

function getUncalculatedCarExpenses (claimData) {
  return claimData.ClaimExpenses ? claimData.ClaimExpenses.filter(function (expense) { return expense.ExpenseType === 'car' && expense.Cost === 0 }) : []
}

function getPrisonPostCode (nameOfPrison) {
  var prison = enumHelper.getKeyByValue(prisonsEnum, nameOfPrison)
  return prison ? prison.postcode : null
}

function getDistanceInMilesAndCost (visitorPostCode, prisonPostCode) {
  return callDistanceApiForPostcodes(visitorPostCode, prisonPostCode)
    .then(function (distanceInKm) {
      var cost = 0.0
      var distanceInMiles = null

      if (distanceInKm) {
        distanceInMiles = distanceInKm * KILOMETERS_TO_MILES
        return getAutoApprovalConfig()
          .then(function (config) {
            var costPerMile = parseFloat(config.CostPerMile)
            cost = Number(Math.round(distanceInMiles * costPerMile + 'e2') + 'e-2') // accurate 2 decimal place rounding

            return { cost: cost, distanceInMiles: distanceInMiles }
          })
      } else {
        return { cost: cost, distanceInMiles: distanceInMiles }
      }
    })
}
