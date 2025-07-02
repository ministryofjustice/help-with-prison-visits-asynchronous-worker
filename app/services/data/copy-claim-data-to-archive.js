const config = require('../../../knexfile').archive
const knex = require('knex')(config) // eslint-disable-line import/order

module.exports = data => {
  return copyEligibilityDataIfNotPresent(data).then(() => {
    return copyClaimData(data)
  })
}

function copyEligibilityDataIfNotPresent(data) {
  return knex('IntSchema.Eligibility')
    .where('EligibilityId', data.Eligibility.EligibilityId)
    .count('EligibilityId as count')
    .then(countResult => {
      const eligibilityNotPresent = countResult[0].count === 0

      if (eligibilityNotPresent) {
        return insertInternal('Eligibility', data.Eligibility).then(() => {
          return Promise.all([
            insertInternal('Visitor', data.Visitor),
            insertInternal('Prisoner', data.Prisoner),
            insertInternal('EligibleChild', data.EligibleChild),
            insertInternal('Benefit', data.Benefit),
          ])
        })
      }
      return Promise.resolve()
    })
}

function copyClaimData(data) {
  cleanClaimDeductions(data.ClaimDeductions)
  cleanClaimEvents(data.ClaimEvents)

  return insertInternal('Claim', data.Claim)
    .then(() => {
      return insertInternalAll('ClaimExpense', data.ClaimExpenses) // Documents reference ClaimExpenseId
    })
    .then(() => {
      return insertClaimDocuments(data.ClaimDocument) // Events reference ClaimDocumentId
    })
    .then(() => {
      return Promise.all([
        insertInternalAll('ClaimEscort', data.ClaimEscorts),
        insertInternalAll('ClaimDeduction', data.ClaimDeductions),
        insertInternalAll('ClaimEvent', data.ClaimEvents),
        insertInternalAll('ClaimChild', data.ClaimChildren),
        insertInternal('ClaimBankDetail', data.ClaimBankDetail),
      ])
    })
}

function insertInternal(table, tableData) {
  let tableId = null
  if (tableData) {
    if (tableData[`${table}Id`]) {
      tableId = tableData[`${table}Id`]
    }
    return knex(`IntSchema.${table}`)
      .where(`${table}Id`, tableId)
      .count(`${table}Id as count`)
      .then(countResult => {
        const dataNotPresent = countResult[0].count === 0
        if (dataNotPresent) {
          return knex(`IntSchema.${table}`).insert(tableData)
        }
        return Promise.resolve()
      })
  }
  return Promise.resolve()
}

function insertInternalAll(table, tableDataArray) {
  const inserts = []

  if (tableDataArray) {
    tableDataArray.forEach(tableData => {
      inserts.push(insertInternal(table, tableData))
    })
  }

  return Promise.all(inserts)
}

function insertClaimDocuments(allClaimDocuments) {
  const claimDocumentInserts = []
  const eligibilityDocumentInserts = []
  const eligibilityDocuments = allClaimDocuments.filter(claimDocument => {
    return !claimDocument.ClaimId
  })
  const claimDocuments = allClaimDocuments.filter(claimDocument => {
    return claimDocument.ClaimId
  })

  if (claimDocuments) {
    claimDocuments.forEach(claimDocument => {
      claimDocumentInserts.push(insertInternal('ClaimDocument', claimDocument))
    })
  }

  if (eligibilityDocuments) {
    eligibilityDocuments.forEach(eligibilityDocument => {
      eligibilityDocumentInserts.push(insertInternal('ClaimDocument', eligibilityDocument))
    })
  }

  return Promise.all(claimDocumentInserts).then(() => {
    return Promise.all(eligibilityDocumentInserts)
  })
}

function cleanClaimDeductions(claimDeductions) {
  if (claimDeductions) {
    claimDeductions.forEach(claimDeduction => {
      delete claimDeduction.ClaimDeductionId
    })
  }
}

function cleanClaimEvents(claimEvents) {
  if (claimEvents) {
    claimEvents.forEach(claimEvent => {
      delete claimEvent.ClaimEventId
    })
  }
}
