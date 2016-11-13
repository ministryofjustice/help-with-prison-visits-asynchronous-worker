const Promise = require('bluebird')
const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (reference, eligibilityId, claimId, status) {
  return Promise.all([getEligilibility(reference, eligibilityId, status),
    getPrisoner(reference, eligibilityId),
    getVisitor(reference, eligibilityId),
    getClaim(claimId, status),
    getClaimChildren(claimId),
    getClaimExpenses(claimId),
    getClaimDocuments(claimId),
    getClaimBankDetail(claimId)
  ]).then(function (results) {
    return {
      Eligibility: results[0],
      Prisoner: results[1],
      Visitor: results[2],
      Claim: results[3],
      ClaimChildren: results[4],
      ClaimExpenses: results[5],
      ClaimDocument: results[6],
      ClaimBankDetail: results[7]
    }
  })
}

function getEligilibility (reference, eligibilityId, status) {
  return knex('ExtSchema.Eligibility')
    .first()
    .where({'Reference': reference, 'EligibilityId': eligibilityId, 'Status': status})
    .then(function (eligibility) {
      if (!eligibility) {
        throw new Error(`Could not find valid completed Eligibility for reference: ${reference}`)
      }
      return eligibility
    })
}

function getClaim (claimId, status) {
  return knex('ExtSchema.Claim')
    .first()
    .where({'ClaimId': claimId, 'Status': status})
    .then(function (claim) {
      if (!claim) {
        throw new Error(`Could not find valid completed Claim for claimId: ${claimId}`)
      }
      return claim
    })
}

function getPrisoner (reference, eligibilityId) {
  return knex('ExtSchema.Prisoner').first().where({'Reference': reference, 'EligibilityId': eligibilityId})
}

function getVisitor (reference, eligibilityId) {
  return knex('ExtSchema.Visitor').first().where({'Reference': reference, 'EligibilityId': eligibilityId})
}

function getClaimExpenses (claimId) {
  return knex('ExtSchema.ClaimExpense').select().where({'ClaimId': claimId, 'IsEnabled': true})
}

function getClaimBankDetail (claimId) {
  return knex('ExtSchema.ClaimBankDetail').first().where('ClaimId', claimId)
}

function getClaimChildren (claimId) {
  return knex('ExtSchema.ClaimChild').select().where({'ClaimId': claimId, 'IsEnabled': true})
}

function getClaimDocuments (claimId) {
  return knex('ExtSchema.ClaimDocument').select().where({'ClaimId': claimId, 'IsEnabled': true})
}
