const config = require('../knexfile').asyncworker
const knex = require('knex')(config)
const dateFormatter = require('../app/services/date-formatter')

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

module.exports.insertClaimEligibilityData = function (schema, reference, status, randomIds) {
  var data = this.getClaimData(reference, randomIds)
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
        return knex('ExtSchema.EligibilityVisitorUpdateContactDetail').insert(data.EligibilityVisitorUpdateContactDetail)
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

module.exports.getClaimData = function (reference, randomIds) {
  // Add random number to ID when generating muliple with same reference number
  var randomAddition = randomIds ? Math.floor((Math.random() * 10000) + 1) : 0
  // Generate unique Integer for Ids using timestamp in tenth of seconds
  var uniqueId = Math.floor(Date.now() / 100) - 14000000000 + randomAddition
  var uniqueId2 = uniqueId + 1

  return {
    Eligibility: {
      EligibilityId: uniqueId,
      Reference: reference,
      DateCreated: dateFormatter.now().toDate(),
      DateSubmitted: dateFormatter.now().toDate(),
      Status: 'SUBMITTED'
    },
    Claim: {
      ClaimId: uniqueId,
      EligibilityId: uniqueId,
      Reference: reference,
      DateOfJourney: dateFormatter.now().toDate(),
      DateCreated: dateFormatter.now().toDate(),
      DateSubmitted: dateFormatter.now().toDate(),
      Status: 'SUBMITTED',
      IsAdvanceClaim: true,
      PaymentMethod: 'bank'
    },
    Prisoner: {
      PrisonerId: uniqueId,
      EligibilityId: uniqueId,
      Reference: reference,
      FirstName: 'Joe',
      LastName: 'Bloggs',
      DateOfBirth: dateFormatter.now().toDate(),
      PrisonNumber: 'A1234BC',
      NameOfPrison: 'hewell'
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
      DateOfBirth: dateFormatter.now().toDate(),
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
        DateOfBirth: dateFormatter.now().toDate(),
        Relationship: 'prisoners-child',
        IsEnabled: true
      },
      {
        ClaimChildId: uniqueId2,
        EligibilityId: uniqueId,
        Reference: reference,
        ClaimId: uniqueId,
        FirstName: 'Mike',
        LastName: 'Bloggs',
        DateOfBirth: dateFormatter.now().toDate(),
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
        DateSubmitted: dateFormatter.now().toDate(),
        IsEnabled: true
      },
      {
        ClaimDocumentId: uniqueId2,
        EligibilityId: uniqueId,
        Reference: reference,
        ClaimId: null,
        DocumentType: 'BENEFIT',
        ClaimExpenseId: null,
        DocumentStatus: 'uploaded',
        Filepath: null,
        DateSubmitted: dateFormatter.now().toDate(),
        IsEnabled: true
      }
    ],
    ClaimBankDetail: {
      ClaimBankDetailId: uniqueId,
      EligibilityId: uniqueId,
      Reference: reference,
      ClaimId: uniqueId,
      AccountNumber: '00123456',
      SortCode: '001122',
      NameOnAccount: 'Joe Bloggs',
      RollNumber: 'ROLL-1BE.R'
    },
    EligibilityVisitorUpdateContactDetail: {
      EligibilityId: uniqueId,
      Reference: reference,
      EmailAddress: 'newEmail@test.com',
      PhoneNumber: '0123456789',
      DateSubmitted: dateFormatter.now().toDate()
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

module.exports.claimMigrationData = function (reference) {
  var eligibilityId = 0
  var claimId = 0
  var claimExpenseId = 0
  var eligibility = { Reference: reference, DateCreated: dateFormatter.now().toDate(), Status: 'SUBMITTED' }
  var prisoner = { EligibilityId: eligibilityId, Reference: reference, FirstName: 'Joe', LastName: 'Bloggs', DateOfBirth: dateFormatter.now().toDate(), PrisonNumber: 'LP1735L', NameOfPrison: 'Test Prison' }
  var visitor = { EligibilityId: eligibilityId, Reference: reference, FirstName: 'Joe', LastName: 'Bloggs', NationalInsuranceNumber: 'AA123456P', HouseNumberAndStreet: '', Town: '', County: '', PostCode: '', Country: '', EmailAddress: '', PhoneNumber: '', DateOfBirth: dateFormatter.now().toDate(), Relationship: 'sibling', Benefit: 'Benefit test' }
  var claim = { EligibilityId: eligibilityId, Reference: reference, Status: 'SUBMITTED', IsAdvanceClaim: false, DateOfJourney: dateFormatter.now().toDate(), DateCreated: dateFormatter.now().toDate(), DateSubmitted: dateFormatter.now().toDate(), PaymentMethod: 'payout' }
  var claimExpense = { EligibilityId: eligibilityId, Reference: reference, ClaimId: claimId, ExpenseType: 'car', Cost: 0, TravelTime: null, From: 'London', To: 'Hewell', IsReturn: false, DurationOfTravel: null, TicketType: null, IsEnabled: true }
  var claimDocument = { EligibilityId: eligibilityId, Reference: reference, ClaimId: claimId, DocumentType: 'RECEIPT', ClaimExpenseId: claimExpenseId, DocumentStatus: 'UPLOADED', Filepath: 'path/to/nowhere', DateSubmitted: dateFormatter.now().toDate(), IsEnabled: true }

  return knex('ExtSchema.Eligibility').insert(eligibility).returning('EligibilityId')
    .then(function (id) {
      eligibilityId = id[0]
      eligibility.EligibilityId = eligibilityId
      prisoner.EligibilityId = eligibilityId
      visitor.EligibilityId = eligibilityId
      claim.EligibilityId = eligibilityId
      claimExpense.EligibilityId = eligibilityId
      claimDocument.EligibilityId = eligibilityId
      return knex('ExtSchema.Prisoner').insert(prisoner).returning('PrisonerId')
    })
    .then(function (prisonerId) {
      prisoner.PrisonerId = prisonerId[0]
      return knex('ExtSchema.Visitor').insert(visitor).returning('VisitorId')
    })
    .then(function (VisitorId) {
      visitor.VisitorId = VisitorId[0]
      return knex('ExtSchema.Claim').insert(claim).returning('ClaimId')
    })
    .then(function (id) {
      claimId = id[0]
      claim.ClaimId = claimId
      claimExpense.ClaimId = claimId
      claimDocument.ClaimId = claimId
      return knex('ExtSchema.ClaimExpense').insert(claimExpense).returning('ClaimExpenseId')
    })
    .then(function (id) {
      claimExpenseId = id[0]
      claimExpense.ClaimExpenseId = claimExpenseId
      claimDocument.ClaimExpenseId = claimExpenseId
      return knex('ExtSchema.ClaimDocument').insert(claimDocument).returning('ClaimDocumentId')
    })
    .then(function (ClaimDocumentId) {
      claimDocument.ClaimDocumentId = ClaimDocumentId[0]
      return {
        Eligibility: eligibility,
        Prisoner: prisoner,
        Visitor: visitor,
        Claim: claim,
        ClaimChildren: [],
        ClaimExpenses: [claimExpense],
        ClaimDocument: [claimDocument],
        ClaimEscort: [],
        ClaimEvents: null,
        ClaimDeductions: null
      }
    })
}

module.exports.orphanedClaimDocument = function (eligibilityId, claimId, reference) {
  var claimDocument = { EligibilityId: eligibilityId, Reference: reference, ClaimId: claimId, ClaimExpenseId: 0, DocumentType: 'RECEIPT', DocumentStatus: 'UPLOADED', Filepath: 'path/to/nowhere', DateSubmitted: dateFormatter.now().toDate(), IsEnabled: true }
  return knex('ExtSchema.ClaimDocument').insert(claimDocument).returning('ClaimDocumentId')
    .then(function (ClaimDocumentId) {
      claimDocument.ClaimDocumentId = ClaimDocumentId[0]
      return {
        ClaimDocument: [claimDocument]
      }
    })
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
    Claim: getClaimObject(claimId1, uniqueId, reference, dateFormatter.now().toDate(), subtractDateFromNow(29, 'days'), subtractDateFromNow(2, 'days'), 'NEW'),
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
      dateFormatter.now().subtract(9, 'months').add(10, 'days').toDate(),
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
        dateFormatter.now().subtract(3, 'months').add(10, 'days').toDate(),
        'APPROVED'
      ),
      getClaimObject(claimId3,
        uniqueId,
        reference,
        subtractDateFromNow(6, 'months'),
        subtractDateFromNow(6, 'months'),
        dateFormatter.now().subtract(6, 'months').add(10, 'days').toDate(),
        'APPROVED'
      ),
      getClaimObject(claimId4,
        uniqueId,
        reference,
        subtractDateFromNow(9, 'months'),
        subtractDateFromNow(9, 'months'),
        dateFormatter.now().subtract(9, 'months').add(10, 'days').toDate(),
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
    DateReviewed: status === 'APPROVED' || status === 'AUTO-APPROVED' || status === 'REJECTED' || status === 'REQUEST_INFORMATION' ? dateFormatter.now().toDate() : null,
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
  return dateFormatter.now().subtract(amount, unit).toDate()
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
