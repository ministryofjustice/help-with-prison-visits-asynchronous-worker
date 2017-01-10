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
    .then(function () {
      if (schema === 'ExtSchema') {
        return deleteByReference(`${schema}.EligibilityVisitorUpdateContactDetail`, reference)
      } else {
        return deleteByReference(`${schema}.ClaimEvent`, reference)
          .then(function () { return deleteByReference(`${schema}.ClaimDeduction`, reference) })
      }
    })
    .then(function () { return deleteByReference(`${schema}.Claim`, reference) })
    .then(function () { return deleteByReference(`${schema}.Visitor`, reference) })
    .then(function () { return deleteByReference(`${schema}.Prisoner`, reference) })
    .then(function () { return deleteByReference(`${schema}.Eligibility`, reference) })
}

module.exports.insertClaimEligibilityData = function (schema, reference, status) {
  var data = this.getClaimData(reference)
  if (status) {
    data.Claim.Status = status
  }
  var insertClaimData = this.insertClaimData

  var newEligibilityId
  var newClaimBankDetailId = data.ClaimBankDetail.ClaimBankDetailId
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
      return { eligibilityId: newEligibilityId, claimId: newClaimId, claimBankDetailId: newClaimBankDetailId }
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
        delete data.EligibilityVisitorUpdateContactDetail.EligibilityVisitorUpdateContactDetailId
        data.EligibilityVisitorUpdateContactDetail.EligibilityId = newEligibilityId
        return knex(`ExtSchema.EligibilityVisitorUpdateContactDetail`).insert(data.EligibilityVisitorUpdateContactDetail)
      }
    })
    .then(function () {
      if (isExtSchema) {
        delete data.ClaimExpenses[0].ClaimExpenseId
        delete data.ClaimExpenses[1].ClaimExpenseId
        delete data.ClaimExpenses[0].ApprovedCost
        delete data.ClaimExpenses[1].ApprovedCost
        data.ClaimExpenses[0].EligibilityId = newEligibilityId
        data.ClaimExpenses[1].EligibilityId = newEligibilityId
        data.ClaimExpenses[0].ClaimId = newClaimId
        data.ClaimExpenses[1].ClaimId = newClaimId
      }
      return knex(`${schema}.ClaimExpense`).insert(data.ClaimExpenses)
    })
    .then(function () {
      return insertClaimDocuments(schema, newEligibilityId, newClaimId, data.ClaimDocument)
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
      if (isExtSchema) {
        Promise.resolve(null)
      } else {
        return knex(`${schema}.ClaimDeduction`).insert(data.ClaimDeduction)
      }
    })
    .then(function () {
      return newClaimId
    })
}

module.exports.insertClaimDocumentData = insertClaimDocuments

module.exports.getClaimData = function (reference) {
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
      Status: 'SUBMITTED',
      IsAdvanceClaim: true
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
        FirstName: 'Sam',
        LastName: 'Bloggs',
        DateOfBirth: new Date(),
        Relationship: 'prisoners-child',
        IsEnabled: true
      },
      { ClaimChildId: uniqueId2,
        EligibilityId: uniqueId,
        Reference: reference,
        ClaimId: uniqueId,
        FirstName: 'Mike',
        LastName: 'Bloggs',
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
        ApprovedCost: 10,
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
        ApprovedCost: 20,
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
    },
    EligibilityVisitorUpdateContactDetail: {
      EligibilityId: uniqueId,
      Reference: reference,
      EmailAddress: 'newEmail@test.com',
      PhoneNumber: '0123456789',
      DateSubmitted: new Date()
    },
    ClaimDeduction: [
      {
        EligibilityId: uniqueId,
        ClaimId: uniqueId,
        Reference: reference,
        DeductionType: 'hc3',
        Amount: 10,
        IsEnabled: true
      },
      {
        EligibilityId: uniqueId,
        ClaimId: uniqueId,
        Reference: reference,
        DeductionType: 'overpayment',
        Amount: 5,
        IsEnabled: true
      }
    ]
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
    Claim: getClaimObject(claimId1, uniqueId, reference, moment().toDate(), subtractDateFromNow(29, 'days'), subtractDateFromNow(2, 'days'), 'NEW'),
    ClaimChildren: [
      getClaimChildObject(1, claimId1, uniqueId, reference, 'Child', 'A', 'my-child', subtractDateFromNow(10, 'years')),
      getClaimChildObject(2, claimId1, uniqueId, reference, 'Child', 'B', 'my-child', subtractDateFromNow(15, 'years'))
    ],
    ClaimDocument: [
      getClaimDocumentObject(1, claimId1, uniqueId, reference, 'VISIT-CONFIRMATION', 'uploaded')
    ],
    ClaimExpenses: [
      getClaimExpenseObject(claimExpenseId1, claimId1, uniqueId, reference, 'car hire', 45),
      getClaimExpenseObject(claimExpenseId2, claimId1, uniqueId, reference, 'plane', 100)
    ],
    Visitor: {
      EmailAddress: 'donotsend@apvs.com'
    },
    Prisoner: getPrisonerObject(1, uniqueId, reference, 'Hewell'),
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
    ),
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
    ]
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
    DateReviewed: status === 'APPROVED' || status === 'AUTO-APPROVED' || status === 'REJECTED' || status === 'REQUEST_INFORMATION' ? moment().toDate() : null,
    Status: status,
    Note: 'test note'
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

function getClaimChildObject (claimChildId, claimId, eligibilityId, reference, firstName, lastName, relationship, dateOfBirth) {
  return {
    ClaimChildId: claimChildId,
    ClaimId: claimId,
    EligibilityId: eligibilityId,
    Reference: reference,
    FirstName: firstName,
    LastName: lastName,
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

function insertClaimDocuments (schema, eligibilityId, claimId, data) {
  var isExtSchema = schema === 'ExtSchema'
  if (isExtSchema) {
    delete data[0].ClaimDocumentId
    delete data[1].ClaimDocumentId
    data[0].EligibilityId = eligibilityId
    data[1].EligibilityId = eligibilityId
    data[0].ClaimId = claimId
    data[1].ClaimId = claimId
  }
  return knex(`${schema}.ClaimDocument`).insert(data)
}
