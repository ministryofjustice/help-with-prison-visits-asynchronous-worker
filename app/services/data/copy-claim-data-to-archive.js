const config = require('../../../knexfile').archive
const knex = require('knex')(config)
const Promise = require('bluebird')

module.exports = function (data) {
  return copyEligibilityDataIfNotPresent(data)
    .then(function () {
      return copyClaimData(data)
    })
}

function copyEligibilityDataIfNotPresent (data) {
  return knex('IntSchema.Eligibility')
    .where('EligibilityId', data.Eligibility.EligibilityId)
    .count('EligibilityId as count')
    .then(function (countResult) {
      var eligibilityNotPresent = countResult[0].count === 0

      if (eligibilityNotPresent) {
        return insertInternal('Eligibility', data.Eligibility)
          .then(function () {
            return Promise.all([
              insertInternal('Visitor', data.Visitor),
              insertInternal('Prisoner', data.Prisoner)])
          })
      } else {
        return Promise.resolve()
      }
    })
}

function copyClaimData (data) {
  return insertInternal('Claim', data.Claim)
    .then(function () {
      return Promise.all([
        insertInternalAll('ClaimEscort', data.ClaimEscorts),
        insertInternalAll('ClaimDeduction', data.ClaimDeductions),
        insertInternalAll('ClaimEvent', data.ClaimEvent),
        insertInternalAll('ClaimChild', data.ClaimChildren),
        insertInternalAll('ClaimDocument', data.ClaimDocument),
        insertInternal('ClaimBankDetail', data.ClaimBankDetail),
        insertInternalAll('ClaimExpense', data.ClaimExpenses)])
    })
}

function insertInternal (table, tableData) {
  if (tableData) {
    return knex(`IntSchema.${table}`).insert(tableData)
  } else {
    return Promise.resolve()
  }
}

function insertInternalAll (table, tableDataArray) {
  var inserts = []

  if (tableDataArray) {
    tableDataArray.forEach(function (tableData) {
      inserts.push(insertInternal(table, tableData))
    })
  }

  return Promise.all(inserts)
}
