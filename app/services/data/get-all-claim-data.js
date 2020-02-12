const Promise = require('bluebird')
const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (schema, reference, eligibilityId, claimId, getDisabledDocuments = false) {
  return Promise.all([getEligilibility(schema, reference, eligibilityId),
    getPrisoner(schema, reference, eligibilityId),
    getEligibleChild(schema, reference, eligibilityId),
    getBenefit(schema, reference, eligibilityId),
    getVisitor(schema, reference, eligibilityId),
    getClaim(schema, claimId),
    getClaimChildren(schema, claimId),
    getClaimExpenses(schema, claimId),
    getClaimDocuments(schema, reference, eligibilityId, claimId, getDisabledDocuments),
    getClaimBankDetail(schema, claimId),
    getEligibilityVisitorUpdateContactDetail(schema, reference, eligibilityId),
    getClaimEscort(schema, claimId),
    getClaimEvents(schema, claimId),
    getClaimDeductions(schema, claimId)
  ]).then(function (results) {
    return {
      Eligibility: results[0],
      Prisoner: results[1],
      EligibleChild: results[2],
      Benefit: results[3],
      Visitor: results[4],
      Claim: results[5],
      ClaimChildren: results[6],
      ClaimExpenses: results[7],
      ClaimDocument: results[8],
      ClaimBankDetail: results[9],
      EligibilityVisitorUpdateContactDetail: results[10],
      ClaimEscort: results[11],
      ClaimEvents: results[12],
      ClaimDeductions: results[13]
    }
  })
}

function getEligilibility (schema, reference, eligibilityId) {
  return knex(`${schema}.Eligibility`).first().where({'Reference': reference, 'EligibilityId': eligibilityId})
}

function getClaim (schema, claimId) {
  return knex(`${schema}.Claim`).first().where({'ClaimId': claimId})
}

function getPrisoner (schema, reference, eligibilityId) {
  return knex(`${schema}.Prisoner`).first().where({'Reference': reference, 'EligibilityId': eligibilityId})
}

function getEligibleChild (schema, reference, eligibilityId) {
  return knex(`${schema}.EligibleChild`).select().where({'Reference': reference, 'EligibilityId': eligibilityId})
}

function getBenefit (schema, reference, eligibilityId) {
  return knex(`${schema}.Benefit`).first().where({'Reference': reference, 'EligibilityId': eligibilityId})
}

function getVisitor (schema, reference, eligibilityId) {
  return knex(`${schema}.Visitor`).first().where({'Reference': reference, 'EligibilityId': eligibilityId})
}

function getClaimExpenses (schema, claimId) {
  return knex(`${schema}.ClaimExpense`).select().where({'ClaimId': claimId, 'IsEnabled': true})
}

function getClaimBankDetail (schema, claimId) {
  return knex(`${schema}.ClaimBankDetail`).first().where('ClaimId', claimId)
}

function getClaimChildren (schema, claimId) {
  return knex(`${schema}.ClaimChild`).select().where({'ClaimId': claimId, 'IsEnabled': true})
}

function getClaimDocuments (schema, reference, eligibilityId, claimId, getDisabledDocuments) {
  if (getDisabledDocuments) {
    return knex(`${schema}.ClaimDocument`).select()
      .where({'Reference': reference, 'EligibilityId': eligibilityId, 'ClaimId': claimId})
      .orWhere({'Reference': reference, 'EligibilityId': eligibilityId, 'ClaimId': null})
  } else {
    return knex(`${schema}.ClaimDocument`).select()
      .where({'Reference': reference, 'EligibilityId': eligibilityId, 'ClaimId': claimId, 'IsEnabled': true})
      .orWhere({'Reference': reference, 'EligibilityId': eligibilityId, 'ClaimId': null, 'IsEnabled': true})
  }
}

function getClaimEscort (schema, claimId) {
  return knex(`${schema}.ClaimEscort`).select().where({'ClaimId': claimId, 'IsEnabled': true})
}

function getEligibilityVisitorUpdateContactDetail (schema, reference, eligibilityId) {
  if (schema === 'ExtSchema') {
    return knex(`${schema}.EligibilityVisitorUpdateContactDetail`).first().where({'Reference': reference, 'EligibilityId': eligibilityId}).orderBy('DateSubmitted', 'desc')
  } else {
    return Promise.resolve(null)
  }
}

function getClaimEvents (schema, claimId) {
  if (schema === 'IntSchema') {
    return knex(`${schema}.ClaimEvent`).select().where({'ClaimId': claimId})
  } else {
    return Promise.resolve(null)
  }
}

function getClaimDeductions (schema, claimId) {
  if (schema === 'IntSchema') {
    return knex(`${schema}.ClaimDeduction`).select().where({'ClaimId': claimId, 'IsEnabled': true})
  } else {
    return Promise.resolve(null)
  }
}
