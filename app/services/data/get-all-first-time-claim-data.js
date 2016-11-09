const Promise = require('bluebird')
const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (reference, claimId, status) {
  return Promise.all([getEligilibility(reference, claimId, status),
                      getPrisoner(reference),
                      getVisitor(reference),
                      getClaim(reference, claimId, status),
                      getClaimExpenses(claimId),
                      getClaimBankDetail(claimId),
                      getClaimChildren(claimId)
    ]).then(function (results) {
      return {
        Eligibility: results[0],
        Prisoner: results[1],
        Visitor: results[2],
        Claim: results[3],
        ClaimExpenses: results[4],
        ClaimBankDetail: results[5],
        ClaimChildren: results[6]
      }
    })
}

function getEligilibility (reference, claimId, status) {
  return knex('ExtSchema.Eligibility')
    .first()
    .where({'Reference': reference, 'Status': status})
    .then(function (eligibility) {
      if (!eligibility) {
        throw new Error(`Could not find valid completed Eligibility for reference: ${reference}`)
      }
      return eligibility
    })
}

function getClaim (reference, claimId, status) {
  return knex('ExtSchema.Claim')
          .first()
          .where({'Reference': reference, 'ClaimId': claimId, 'Status': status})
          .then(function (claim) {
            if (!claim) {
              throw new Error(`Could not find valid completed Claim for reference: ${reference}, claimId: ${claimId}`)
            }
            return claim
          })
}

function getPrisoner (reference) {
  return knex('ExtSchema.Prisoner').first().where('Reference', reference)
}

function getVisitor (reference) {
  return knex('ExtSchema.Visitor').first().where('Reference', reference)
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
