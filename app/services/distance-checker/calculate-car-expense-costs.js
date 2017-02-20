const Promise = require('bluebird')
const config = require('../../../config')
const callDistanceApiForPostcodes = require('./call-distance-api-for-postcodes')
const updateExpenseForDistanceCalculation = require('../data/update-expense-for-distance-calculation')
const getAutoApprovalConfig = require('../data/get-auto-approval-config')
const prisonsEnum = require('../../constants/prisons-enum')
const enumHelper = require('../../constants/helpers/enum-helper')

const KILOMETERS_TO_MILES = 0.621371

module.exports = function (reference, eligibilityId, claimId, claimData) {
  if (config.DISTANCE_CALCULATION_ENABLED !== 'true') {
    return Promise.resolve()
  }

  var carExpenses = getUncalculatedCarExpenses(claimData)
  var visitorPostCode = claimData.Visitor.PostCode
  var prisonPostCode = getPrisonPostCode(claimData.Prisoner.NameOfPrison)

  if (carExpenses.length > 0 && visitorPostCode && prisonPostCode) {
    var promises = []

    return getDistanceInMilesAndCost(visitorPostCode, prisonPostCode)
      .then(function (result) {
        var cost = result.cost
        var distanceInMiles = result.distanceInMiles

        if (distanceInMiles > parseFloat(config.DISTANCE_CALCULATION_MAX_MILES)) {
          cost = 0.0
        }

        carExpenses.forEach(function (carExpense) {
          promises.push(updateExpenseForDistanceCalculation(carExpense.ClaimExpenseId, visitorPostCode, prisonPostCode, distanceInMiles, cost))
        })

        return Promise.all(promises)
      })
  } else {
    return Promise.resolve()
  }
}

function getUncalculatedCarExpenses (claimData) {
  return claimData.ClaimExpenses ? claimData.ClaimExpenses.filter(function (expense) { return expense.ExpenseType === 'car' && expense.Cost === '0.00' }) : []
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

              return {cost: cost, distanceInMiles: distanceInMiles}
            })
        } else {
          return {cost: cost, distanceInMiles: distanceInMiles}
        }
      })
}
