/* COMMENTED OUT AS LOCAL AND DEV ENVIRONMENTS DO NO HAVE ARCHIVE DB
const config = require('../../../../knexfile').archive
const testHelper = require('../../../test-helper')

const copyClaimDataToArchive = require('../../../../app/services/data/copy-claim-data-to-archive')

const REFERENCE = 'COPYARC'

var claimData = testHelper.getClaimData(REFERENCE)

describe('services/data/copy-claim-data-to-archive', () => {
  it('should copy the claim to the archive database', () => {
    return copyClaimDataToArchive(claimData).then(() => {
      return knex('IntSchema.Eligibility').where('IntSchema.Eligibility.Reference', REFERENCE)
        .join('IntSchema.Prisoner', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Prisoner.EligibilityId')
        .join('IntSchema.Visitor', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
        .join('IntSchema.Claim', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Claim.EligibilityId')
        .join('IntSchema.ClaimBankDetail', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimBankDetail.ClaimId')
        .select()
        .then(result => {
          expect(results[0].AccountNumber).to.be.equal(claimData.ClaimBankDetail.AccountNumber)
          expect(results[0].NationalInsuranceNumber).to.be.equal(claimData.Visitor.NationalInsuranceNumber)
          expect(results[0].PrisonNumber).to.be.equal(claimData.Prisoner.PrisonNumber)
        })
        .then(() => {
          return knex('IntSchema.ClaimChild').where('IntSchema.ClaimChild.Reference', REFERENCE)
            .select()
            .then(result => {
              expect(results.length, 'should have two children').to.be.equal(2)
            })
        })
        .then(() => {
          return knex('IntSchema.ClaimExpense').where('IntSchema.ClaimExpense.Reference', REFERENCE)
            .select()
            .then(result => {
              expect(results.length, 'should have two expenses').to.be.equal(2)
              expect(results[0].ExpenseType).to.be.equal('car')
              expect(results[1].ExpenseType).to.be.equal('bus')
            })
        })
        .then(() => {
          return knex('IntSchema.ClaimDocument').where('IntSchema.ClaimDocument.Reference', REFERENCE)
            .select()
            .then(result => {
              expect(results.length, 'should have two documents').to.be.equal(2)
            })
        })
    })
  })

  afterEach(() => {
    return deleteAll(REFERENCE)
  })
})

function deleteByReference (table, reference) {
  return knex(`IntSchema.${table}`).where('Reference', reference).del()
}

function deleteAll (reference) {
  return Promise.all([
    deleteByReference('ClaimEscort', reference),
    deleteByReference('ClaimDeduction', reference),
    deleteByReference('ClaimEvent', reference),
    deleteByReference('ClaimChild', reference),
    deleteByReference('ClaimDocument', reference),
    deleteByReference('ClaimBankDetail', reference),
    deleteByReference('ClaimExpense', reference)])
    .then(() => {
      return Promise.all([
        deleteByReference('Claim', reference),
        deleteByReference('Visitor', reference),
        deleteByReference('Prisoner', reference)])
    })
    .then(() => {
      return deleteByReference('Eligibility', reference)
    })
}
*/
