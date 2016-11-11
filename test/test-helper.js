const config = require('../knexfile').asyncworker
const knex = require('knex')(config)

module.exports.getTaskObject = function (taskType, additionalData, taskStatus) {
  var reference = '1234567'
  var claimId = 123
  var dateCreated = new Date('1920-01-01')
  var dateProcessed = null
  var status = taskStatus || 'PENDING'

  return {
    Task: taskType,
    Reference: reference,
    ClaimId: claimId,
    AdditionalData: additionalData,
    DateCreated: dateCreated,
    DateProcessed: dateProcessed,
    Status: status
  }
}

module.exports.deleteAllExternalClaimEligibilityData = function (reference) {
  var claimIds = []

  return knex('ExtSchema.Claim').where('Reference', reference).select('ClaimId')
    .then(function (claimIdsResults) {
      claimIdsResults.forEach(function (result) { claimIds.push(result.ClaimId) })
      return claimIds
    })
    .then(function () {
      return knex('ExtSchema.ClaimBankDetail').whereIn('ClaimId', claimIds).del()
    })
    .then(function () {
      return knex('ExtSchema.ClaimDocument').where('ClaimId', claimIds).del()
    })
    .then(function () {
      return knex('ExtSchema.ClaimExpense').whereIn('ClaimId', claimIds).del()
    })
    .then(function () {
      return knex('ExtSchema.ClaimChild').where('ClaimId', claimIds).del()
    })
    .then(function () {
      return knex('ExtSchema.Claim').whereIn('ClaimId', claimIds).del()
    })
    .then(function () {
      return knex('ExtSchema.Visitor').where('Reference', reference).del()
    })
    .then(function () {
      return knex('ExtSchema.Prisoner').where('Reference', reference).del()
    })
    .then(function () {
      return knex('ExtSchema.Eligibility').where('Reference', reference).del()
    })
}

module.exports.deleteAllInternalClaimEligibilityData = function (reference) {
  var eligibilityIds = []
  var claimIds = []

  return knex('IntSchema.Eligibility').where('Reference', reference).select('EligibilityId')
    .then(function (eligibilityIdsResults) {
      eligibilityIdsResults.forEach(function (result) { eligibilityIds.push(result.EligibilityId) })

      return knex('IntSchema.Claim').whereIn('EligibilityId', eligibilityIds).select('ClaimId')
    })
    .then(function (claimIdsResults) {
      claimIdsResults.forEach(function (result) { claimIds.push(result.ClaimId) })

      return knex('IntSchema.ClaimBankDetail').whereIn('ClaimId', claimIds).del()
    })
    .then(function () {
      return knex('IntSchema.ClaimDocument').where('ClaimId', claimIds).del()
    })
    .then(function () {
      return knex('IntSchema.ClaimExpense').whereIn('ClaimId', claimIds).del()
    })
    .then(function () {
      return knex('IntSchema.ClaimChild').where('ClaimId', claimIds).del()
    })
    .then(function () {
      return knex('IntSchema.Claim').whereIn('ClaimId', claimIds).del()
    })
    .then(function () {
      return knex('IntSchema.Visitor').whereIn('EligibilityId', eligibilityIds).del()
    })
    .then(function () {
      return knex('IntSchema.Prisoner').whereIn('EligibilityId', eligibilityIds).del()
    })
    .then(function () {
      return knex('IntSchema.Eligibility').whereIn('EligibilityId', eligibilityIds).del()
    })
}

module.exports.insertClaimEligibilityData = function (schema, reference) {
  var claimId = 12345 // this will be overridden on insert of claim
  var data = this.getFirstTimeClaimData(reference, claimId)
  var newEligibilityId
  var newClaimId
  var isIntSchema = schema === 'IntSchema'

  delete data.Eligibility.EligibilityId

  return knex(`${schema}.Eligibility`).insert(data.Eligibility)
    .then(function () {
      if (isIntSchema) {
        return knex(`${schema}.Eligibility`).where('Reference', reference).first('EligibilityId')
      }
      return 0
    })
    .then(function (insertedEligibilityId) {
      newEligibilityId = insertedEligibilityId.EligibilityId

      delete data.Claim.ClaimId
      if (isIntSchema) {
        delete data.Claim.Reference
        data.Claim.EligibilityId = newEligibilityId
      }
      return knex(`${schema}.Claim`).insert(data.Claim).returning('ClaimId')
    })
    .then(function (insertedClaimIds) {
      newClaimId = insertedClaimIds[0]

      delete data.ClaimBankDetail.ClaimBankDetailId
      data.ClaimBankDetail.ClaimId = newClaimId
      return knex(`${schema}.ClaimBankDetail`).insert(data.ClaimBankDetail)
    })
    .then(function () {
      delete data.ClaimExpenses[0].ClaimExpenseId
      delete data.ClaimExpenses[1].ClaimExpenseId
      data.ClaimExpenses[0].ClaimId = newClaimId
      data.ClaimExpenses[1].ClaimId = newClaimId
      if (isIntSchema) {
        delete data.ClaimExpenses[0].IsEnabled
        delete data.ClaimExpenses[1].IsEnabled
      }
      return knex(`${schema}.ClaimExpense`).insert(data.ClaimExpenses)
    })
    .then(function () {
      delete data.ClaimDocument[0].ClaimDocumentId
      delete data.ClaimDocument[1].ClaimDocumentId
      data.ClaimDocument[0].ClaimId = newClaimId
      data.ClaimDocument[1].ClaimId = newClaimId
      return knex(`${schema}.ClaimDocument`).insert(data.ClaimDocument)
    })
    .then(function () {
      delete data.ClaimChildren[0].ClaimChildId
      delete data.ClaimChildren[1].ClaimChildId
      data.ClaimChildren[0].ClaimId = newClaimId
      data.ClaimChildren[1].ClaimId = newClaimId
      return knex(`${schema}.ClaimChild`).insert(data.ClaimChildren)
    })
    .then(function () {
      if (isIntSchema) {
        delete data.Visitor.Reference
        data.Visitor.EligibilityId = newEligibilityId
      }

      return knex(`${schema}.Visitor`).insert(data.Visitor)
    })
    .then(function () {
      if (isIntSchema) {
        delete data.Prisoner.Reference
        data.Prisoner.EligibilityId = newEligibilityId
      }

      return knex(`${schema}.Prisoner`).insert(data.Prisoner)
    })
    .then(function () {
      return newClaimId
    })
}

module.exports.getFirstTimeClaimData = function (reference, claimId) {
  return {
    Eligibility: { Reference: reference,
      DateCreated: new Date(),
      DateSubmitted: new Date(),
    Status: 'SUBMITTED' },
    Claim: { ClaimId: claimId,
      Reference: reference,
      DateOfJourney: new Date(),
      DateCreated: new Date(),
      DateSubmitted: new Date(),
    Status: 'SUBMITTED' },
    Prisoner: { Reference: reference,
      FirstName: 'Joe',
      LastName: 'Bloggs',
      DateOfBirth: new Date(),
      PrisonNumber: 'A1234BC',
    NameOfPrison: 'Hewell' },
    Visitor: { Reference: reference,
      Title: 'Mr',
      FirstName: 'Joe',
      LastName: 'Bloggs',
      NationalInsuranceNumber: 'AA123456A',
      HouseNumberAndStreet: '1',
      Town: 'Town',
      County: 'County',
      PostCode: 'AA123AA',
      Country: 'Northern Ireland',
      EmailAddress: 'test@test.com',
      PhoneNumber: '0123456789',
      DateOfBirth: new Date(),
    Relationship: 'partner' },
    ClaimChildren: [ { ClaimChildId: 50,
      ClaimId: claimId,
      Name: 'Sam Bloggs',
      DateOfBirth: new Date(),
      Relationship: 'prisoners-child',
    IsEnabled: true },
      { ClaimChildId: 51,
        ClaimId: claimId,
        Name: 'Mike Bloggs',
        DateOfBirth: new Date(),
        Relationship: 'my-child',
        IsEnabled: true
      } ],
    ClaimExpenses: [ { ClaimExpenseId: 31,
      ClaimId: claimId,
      ExpenseType: 'car',
      Cost: 0,
      IsEnabled: true,
      TravelTime: null,
      From: 'London',
      To: 'Hewell',
      IsReturn: false,
      DurationOfTravel: null,
    TicketType: null },
      { ClaimExpenseId: 32,
        ClaimId: claimId,
        ExpenseType: 'bus',
        Cost: 20.95,
        IsEnabled: true,
        TravelTime: null,
        From: 'Euston',
        To: 'Birmingham New Street',
        IsReturn: false,
        DurationOfTravel: null,
      TicketType: null } ],
    ClaimDocument: [{ClaimDocumentId: 41,
      ClaimId: claimId,
      DocumentType: 'VISITOR-CONFIRMATION',
      ClaimExpenseId: null,
      DocumentStatus: 'uploaded',
      Filepath: 'path',
    DateSubmitted: new Date()},
      { ClaimDocumentId: 42,
        ClaimId: claimId,
        DocumentType: 'BENEFIT',
        ClaimExpenseId: null,
        DocumentStatus: 'post-later',
        Filepath: null,
      DateSubmitted: new Date()}],
    ClaimBankDetail: { ClaimBankDetailId: 31,
      ClaimId: claimId,
      AccountNumber: '00123456',
    SortCode: '001122' }
  }
}
