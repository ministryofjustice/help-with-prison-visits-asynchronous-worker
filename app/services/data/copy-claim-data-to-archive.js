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
              insertInternal('Prisoner', data.Prisoner),
              insertInternal('EligibleChild', data.EligibleChild),
              insertInternal('Benefit', data.Benefit)])
          })
      } else {
        return Promise.resolve()
      }
    })
}

function copyClaimData (data) {
  cleanClaimDeductions(data.ClaimDeductions)
  cleanClaimEvents(data.ClaimEvents)

  return insertInternal('Claim', data.Claim)
    .then(function () {
      return insertInternalAll('ClaimExpense', data.ClaimExpenses) // Documents reference ClaimExpenseId
    })
    .then(function () {
      return insertClaimDocuments(data.ClaimDocument) // Events reference ClaimDocumentId
    })
    .then(function () {
      return Promise.all([
        insertInternalAll('ClaimEscort', data.ClaimEscorts),
        insertInternalAll('ClaimDeduction', data.ClaimDeductions),
        insertInternalAll('ClaimEvent', data.ClaimEvents),
        insertInternalAll('ClaimChild', data.ClaimChildren),
        insertInternal('ClaimBankDetail', data.ClaimBankDetail)])
    })
}

function insertInternal (table, tableData) {
  var tableId = null
  if (tableData) {
    if (tableData[table + 'Id']) {
      tableId = tableData[table + 'Id']
    }
    return knex(`IntSchema.${table}`)
      .where(table + 'Id', tableId)
      .count(table + 'Id as count')
      .then(function (countResult) {
        var dataNotPresent = countResult[0].count === 0
        if (dataNotPresent) {
          return knex(`IntSchema.${table}`).insert(tableData)
        } else {
          return Promise.resolve()
        }
      })
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

function insertClaimDocuments (allClaimDocuments) {
  var claimDocumentInserts = []
  var eligibilityDocumentInserts = []
  var eligibilityDocuments = allClaimDocuments.filter(function (claimDocument) {
    return !claimDocument.ClaimId
  })
  var claimDocuments = allClaimDocuments.filter(function (claimDocument) {
    return claimDocument.ClaimId
  })

  if (claimDocuments) {
    claimDocuments.forEach(function (claimDocument) {
      claimDocumentInserts.push(insertInternal('ClaimDocument', claimDocument))
    })
  }

  if (eligibilityDocuments) {
    eligibilityDocuments.forEach(function (eligibilityDocument) {
      eligibilityDocumentInserts.push(insertInternal('ClaimDocument', eligibilityDocument))
    })
  }

  return Promise.all(claimDocumentInserts)
    .then(function () {
      return Promise.all(eligibilityDocumentInserts)
    })
}

function cleanClaimDeductions (claimDeductions) {
  if (claimDeductions) {
    claimDeductions.forEach(function (claimDeduction) {
      delete claimDeduction.ClaimDeductionId
    })
  }
}

function cleanClaimEvents (claimEvents) {
  if (claimEvents) {
    claimEvents.forEach(function (claimEvent) {
      delete claimEvent.ClaimEventId
    })
  }
}
