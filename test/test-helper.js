const config = require('../knexfile').asyncworker
const knex = require('knex')(config)
const moment = require('moment')

module.exports.getTaskObject = function (taskType, additionalData, taskStatus) {
  var reference = '1234567'
  var eligibilityId = '1234'
  var claimId = 123
  var dateCreated = new Date('1920-01-01')
  var dateProcessed = null
  var status = taskStatus || 'PENDING'

  return {
    Task: taskType,
    Reference: reference,
    EligibilityId: eligibilityId,
    ClaimId: claimId,
    AdditionalData: additionalData,
    DateCreated: dateCreated,
    DateProcessed: dateProcessed,
    Status: status
  }
}

function deleteByReference (schemaTable, reference) {
  return knex(schemaTable).where('Reference', reference).del()
}

module.exports.deleteAll = function (reference, schema) {
  return deleteByReference(`${schema}.Task`, reference)
    .then(function () { return deleteByReference(`${schema}.ClaimBankDetail`, reference) })
    .then(function () { return deleteByReference(`${schema}.ClaimDocument`, reference) })
    .then(function () { return deleteByReference(`${schema}.ClaimExpense`, reference) })
    .then(function () { return deleteByReference(`${schema}.ClaimChild`, reference) })
    .then(function () { return deleteByReference(`${schema}.Claim`, reference) })
    .then(function () { return deleteByReference(`${schema}.Visitor`, reference) })
    .then(function () { return deleteByReference(`${schema}.Prisoner`, reference) })
    .then(function () { return deleteByReference(`${schema}.Eligibility`, reference) })
}

module.exports.insertClaimEligibilityData = function (schema, reference) {
  var data = this.getFirstTimeClaimData(reference)
  var insertClaimData = this.insertClaimData
  var newEligibilityId
  var isExtSchema = schema === 'ExtSchema'

  if (isExtSchema) {
    delete data.Eligibility.EligibilityId
  }

  return knex(`${schema}.Eligibility`).insert(data.Eligibility).returning('EligibilityId')
    .then(function (insertedIds) {
      newEligibilityId = insertedIds[0]
    })
    .then(function () {
      if (isExtSchema) {
        delete data.Visitor.VisitorId
        data.Visitor.EligibilityId = newEligibilityId
      }
      return knex(`${schema}.Visitor`).insert(data.Visitor)
    })
    .then(function () {
      if (isExtSchema) {
        delete data.Prisoner.PrisonerId
        data.Prisoner.EligibilityId = newEligibilityId
      }
      return knex(`${schema}.Prisoner`).insert(data.Prisoner)
    })
    .then(function () {
      return insertClaimData(schema, reference, newEligibilityId, data)
    })
    .then(function (newClaimId) {
      return { eligibilityId: newEligibilityId, claimId: newClaimId }
    })
}

module.exports.insertClaimData = function (schema, reference, newEligibilityId, data) {
  var newClaimId
  var isExtSchema = schema === 'ExtSchema'

  if (isExtSchema) {
    delete data.Claim.ClaimId
    data.Claim.EligibilityId = newEligibilityId
  }

  return knex(`${schema}.Claim`).insert(data.Claim).returning('ClaimId')
    .then(function (insertedClaimIds) {
      newClaimId = insertedClaimIds[0]

      if (isExtSchema) {
        delete data.ClaimBankDetail.ClaimBankDetailId
        data.ClaimBankDetail.EligibilityId = newEligibilityId
        data.ClaimBankDetail.ClaimId = newClaimId
      }
      return knex(`${schema}.ClaimBankDetail`).insert(data.ClaimBankDetail)
    })
    .then(function () {
      if (isExtSchema) {
        delete data.ClaimExpenses[0].ClaimExpenseId
        delete data.ClaimExpenses[1].ClaimExpenseId
        data.ClaimExpenses[0].EligibilityId = newEligibilityId
        data.ClaimExpenses[1].EligibilityId = newEligibilityId
        data.ClaimExpenses[0].ClaimId = newClaimId
        data.ClaimExpenses[1].ClaimId = newClaimId
      }
      return knex(`${schema}.ClaimExpense`).insert(data.ClaimExpenses)
    })
    .then(function () {
      if (isExtSchema) {
        delete data.ClaimDocument[0].ClaimDocumentId
        delete data.ClaimDocument[1].ClaimDocumentId
        data.ClaimDocument[0].EligibilityId = newEligibilityId
        data.ClaimDocument[1].EligibilityId = newEligibilityId
        data.ClaimDocument[0].ClaimId = newClaimId
        data.ClaimDocument[1].ClaimId = newClaimId
      }
      return knex(`${schema}.ClaimDocument`).insert(data.ClaimDocument)
    })
    .then(function () {
      if (isExtSchema) {
        delete data.ClaimChildren[0].ClaimChildId
        delete data.ClaimChildren[1].ClaimChildId
        data.ClaimChildren[0].EligibilityId = newEligibilityId
        data.ClaimChildren[1].EligibilityId = newEligibilityId
        data.ClaimChildren[0].ClaimId = newClaimId
        data.ClaimChildren[1].ClaimId = newClaimId
      }
      return knex(`${schema}.ClaimChild`).insert(data.ClaimChildren)
    })
    .then(function () {
      return newClaimId
    })
}

module.exports.getFirstTimeClaimData = function (reference) {
  // Generate unique Integer for Ids using timestamp in tenth of seconds
  var uniqueId = Math.floor(Date.now() / 100) - 14000000000
  var uniqueId2 = uniqueId + 1

  return {
    Eligibility: {
      EligibilityId: uniqueId,
      Reference: reference,
      DateCreated: new Date(),
      DateSubmitted: new Date(),
      Status: 'SUBMITTED'
    },
    Claim: {
      ClaimId: uniqueId,
      EligibilityId: uniqueId,
      Reference: reference,
      DateOfJourney: new Date(),
      DateCreated: new Date(),
      DateSubmitted: new Date(),
      Status: 'SUBMITTED'
    },
    Prisoner: {
      PrisonerId: uniqueId,
      EligibilityId: uniqueId,
      Reference: reference,
      FirstName: 'Joe',
      LastName: 'Bloggs',
      DateOfBirth: new Date(),
      PrisonNumber: 'A1234BC',
      NameOfPrison: 'Hewell'
    },
    Visitor: {
      VisitorId: uniqueId,
      EligibilityId: uniqueId,
      Reference: reference,
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
      Relationship: 'partner'
    },
    ClaimChildren: [
      {
        ClaimChildId: uniqueId,
        EligibilityId: uniqueId,
        Reference: reference,
        ClaimId: uniqueId,
        Name: 'Sam Bloggs',
        DateOfBirth: new Date(),
        Relationship: 'prisoners-child',
        IsEnabled: true
      },
      { ClaimChildId: uniqueId2,
        EligibilityId: uniqueId,
        Reference: reference,
        ClaimId: uniqueId,
        Name: 'Mike Bloggs',
        DateOfBirth: new Date(),
        Relationship: 'my-child',
        IsEnabled: true
      }
    ],
    ClaimExpenses: [
      {
        ClaimExpenseId: uniqueId,
        EligibilityId: uniqueId,
        Reference: reference,
        ClaimId: uniqueId,
        ExpenseType: 'car',
        Cost: 0,
        IsEnabled: true,
        TravelTime: null,
        From: 'London',
        To: 'Hewell',
        IsReturn: false,
        DurationOfTravel: null,
        TicketType: null
      },
      {
        ClaimExpenseId: uniqueId2,
        EligibilityId: uniqueId,
        Reference: reference,
        ClaimId: uniqueId,
        ExpenseType: 'bus',
        Cost: 20.95,
        IsEnabled: true,
        TravelTime: null,
        From: 'Euston',
        To: 'Birmingham New Street',
        IsReturn: false,
        DurationOfTravel: null,
        TicketType: null
      }
    ],
    ClaimDocument: [
      {
        ClaimDocumentId: uniqueId,
        EligibilityId: uniqueId,
        Reference: reference,
        ClaimId: uniqueId,
        DocumentType: 'VISITOR-CONFIRMATION',
        ClaimExpenseId: null,
        DocumentStatus: 'uploaded',
        Filepath: 'path',
        DateSubmitted: new Date(),
        IsEnabled: true
      },
      {
        ClaimDocumentId: uniqueId2,
        EligibilityId: uniqueId,
        Reference: reference,
        ClaimId: uniqueId,
        DocumentType: 'BENEFIT',
        ClaimExpenseId: null,
        DocumentStatus: 'uploaded',
        Filepath: null,
        DateSubmitted: new Date(),
        IsEnabled: true
      }
    ],
    ClaimBankDetail: {
      ClaimBankDetailId: uniqueId,
      EligibilityId: uniqueId,
      Reference: reference,
      ClaimId: uniqueId,
      AccountNumber: '00123456',
      SortCode: '001122'
    }
  }
}

module.exports.getAutoApprovalData = function (reference) {
  const uniqueId = Math.floor(Date.now() / 100) - 14000000000
  const claimId1 = uniqueId + 1
  const claimId2 = claimId1 + 1
  const claimId3 = claimId2 + 1
  const claimId4 = claimId3 + 1
  const claimExpenseId1 = claimId4 + 1
  const claimExpenseId2 = claimExpenseId1 + 1
  const claimExpenseId3 = claimExpenseId2 + 1
  const claimExpenseId4 = claimExpenseId3 + 1

  return {
    Claim: getClaimObject(claimId1, uniqueId, reference, moment().toDate(), subtractDateFromNow(29, 'days'), subtractDateFromNow(2, 'days')),
    ClaimExpenses: [
      getClaimExpenseObject(claimExpenseId1, claimId1, uniqueId, reference, 'car hire', 45),
      getClaimExpenseObject(claimExpenseId2, claimId1, uniqueId, reference, 'plane', 100)
    ],
    ClaimDocuments: [
      getClaimDocumentObject(1, claimId1, uniqueId, reference, 'VISIT-CONFIRMATION', 'uploaded')
    ],
    ClaimChildren: [
      getClaimChildObject(1, claimId1, uniqueId, reference, 'Child A', 'my-child', subtractDateFromNow(10, 'years')),
      getClaimChildObject(2, claimId1, uniqueId, reference, 'Child B', 'my-child', subtractDateFromNow(15, 'years'))
    ],
    Prisoner: getPrisonerObject(1, uniqueId, reference, 'Hewell'),
    previousClaims: [
      getClaimObject(claimId2,
        uniqueId,
        reference,
        subtractDateFromNow(3, 'months'),
        subtractDateFromNow(3, 'months'),
        moment().subtract(3, 'months').add(10, 'days').toDate(),
        'APPROVED'
      ),
      getClaimObject(claimId3,
        uniqueId,
        reference,
        subtractDateFromNow(6, 'months'),
        subtractDateFromNow(6, 'months'),
        moment().subtract(6, 'months').add(10, 'days').toDate(),
        'APPROVED'
      ),
      getClaimObject(claimId4,
        uniqueId,
        reference,
        subtractDateFromNow(9, 'months'),
        subtractDateFromNow(9, 'months'),
        moment().subtract(9, 'months').add(10, 'days').toDate(),
        'APPROVED'
      )
    ],
    latestManuallyApprovedClaim: getClaimObject(claimId2,
      uniqueId,
      reference,
      subtractDateFromNow(9, 'months'),
      subtractDateFromNow(9, 'months'),
      moment().subtract(9, 'months').add(10, 'days').toDate(),
      'APPROVED',
      [
        getClaimExpenseObject(claimExpenseId3, claimId2, uniqueId, reference, 'car hire', 45),
        getClaimExpenseObject(claimExpenseId4, claimId2, uniqueId, reference, 'plane', 110)
      ]
    )
  }
}

function getClaimObject (claimId, eligibilityId, reference, dateCreated, dateOfJourney, dateSubmitted, status, claimExpenses) {
  var claimObject = {
    ClaimId: claimId,
    EligibilityId: eligibilityId,
    Reference: reference,
    DateCreated: dateCreated,
    DateOfJourney: dateOfJourney,
    DateSubmitted: dateSubmitted,
    Status: status
  }

  if (claimExpenses) {
    claimObject.claimExpenses = claimExpenses
  }

  return claimObject
}

function getClaimExpenseObject (claimExpenseId, claimId, eligibilityId, reference, expenseType, cost) {
  return {
    ClaimExpenseId: claimExpenseId,
    ClaimId: claimId,
    EligibilityId: eligibilityId,
    Reference: reference,
    ExpenseType: expenseType,
    Cost: cost
  }
}

function getClaimDocumentObject (claimDocumentId, claimId, eligibilityId, reference, documentType, documentStatus) {
  return {
    ClaimDocumentId: claimDocumentId,
    ClaimId: claimId,
    EligibilityId: eligibilityId,
    Reference: reference,
    DocumentType: documentType,
    DocumentStatus: documentStatus
  }
}

function getClaimChildObject (claimChildId, claimId, eligibilityId, reference, name, relationship, dateOfBirth) {
  return {
    ClaimChildId: claimChildId,
    ClaimId: claimId,
    EligibilityId: eligibilityId,
    Reference: reference,
    Name: name,
    Relationship: relationship,
    DateOfBirth: dateOfBirth
  }
}

function getPrisonerObject (prisonerId, eligibilityId, reference, nameOfPrison) {
  return {
    PrisonerId: prisonerId,
    EligibilityId: eligibilityId,
    Reference: reference,
    NameOfPrison: nameOfPrison
  }
}

function subtractDateFromNow (amount, unit) {
  return moment().subtract(amount, unit).toDate()
}
