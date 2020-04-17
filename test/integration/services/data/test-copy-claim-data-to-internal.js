const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../../../app/constants/status-enum')
const testHelper = require('../../../test-helper')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

var insertClaimEventStub = sinon.stub().resolves()
var updateContactDetailsStub = sinon.stub().resolves()

const copyClaimDataToInternal = proxyquire('../../../../app/services/data/copy-claim-data-to-internal', {
  './insert-claim-event': insertClaimEventStub,
  './update-contact-details': updateContactDetailsStub
})

const reference = 'COPY123'
const claimId = 123

describe('services/data/copy-claim-data-to-internal', function () {
  describe('first time claim', function () {
    var firstTimeClaimData = testHelper.getClaimData(reference)

    it('should copy the first time claim data to internal and set status to new', function () {
      return knex.transaction(function (trx) {
        return copyClaimDataToInternal(firstTimeClaimData, 'first-time', trx)
      })
        .then(function () {
          return knex('IntSchema.Eligibility').where('IntSchema.Eligibility.Reference', reference)
            .join('IntSchema.Prisoner', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Prisoner.EligibilityId')
            .join('IntSchema.Visitor', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
            .join('IntSchema.Claim', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Claim.EligibilityId')
            .join('IntSchema.ClaimBankDetail', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimBankDetail.ClaimId')
            .select()
            .then(function (results) {
              expect(results[0].Status[0], 'Eligibility.Status should be NEW').to.be.equal(statusEnum.NEW)
              expect(results[0].Status[1], 'Claim.Status should be NEW').to.be.equal(statusEnum.NEW)
              expect(results[0].AccountNumber).to.be.equal(firstTimeClaimData.ClaimBankDetail.AccountNumber)
              expect(results[0].NationalInsuranceNumber).to.be.equal(firstTimeClaimData.Visitor.NationalInsuranceNumber)
              expect(results[0].PrisonNumber).to.be.equal(firstTimeClaimData.Prisoner.PrisonNumber)
            })
            .then(function () {
              return knex('IntSchema.ClaimChild').where('IntSchema.ClaimChild.Reference', reference)
                .select()
                .then(function (results) {
                  expect(results.length, 'should have two children').to.be.equal(2)
                })
            })
            .then(function () {
              return knex('IntSchema.ClaimExpense').where('IntSchema.ClaimExpense.Reference', reference)
                .select()
                .then(function (results) {
                  expect(results.length, 'should have two expenses').to.be.equal(2)
                  expect(results[0].ExpenseType).to.be.equal('car')
                  expect(results[1].ExpenseType).to.be.equal('bus')
                })
            })
            .then(function () {
              return knex('IntSchema.ClaimDocument').where('IntSchema.ClaimDocument.Reference', reference)
                .select()
                .then(function (results) {
                  expect(results.length, 'should have two documents').to.be.equal(2)
                })
            })
        })
    })

    it('should change claim status to PENDING if documents not uploaded', function () {
      firstTimeClaimData.ClaimDocument[0].DocumentStatus = 'post-later'
      firstTimeClaimData.ClaimDocument[1].DocumentStatus = 'upload-later'

      return knex.transaction(function (trx) {
        return copyClaimDataToInternal(firstTimeClaimData, null, trx)
      })
        .then(function () {
          return knex('IntSchema.Claim').where('IntSchema.Claim.Reference', reference)
            .select('Claim.Status')
            .then(function (results) {
              expect(results[0].Status, 'Claim.Status should be PENDING').to.be.equal(statusEnum.PENDING)
            })
        })
    })
  })

  describe('repeat claim', function () {
    const repeatClaimData = testHelper.getClaimData(reference, claimId)
    const existingInternalEligibility = repeatClaimData.Eligibility
    repeatClaimData.Eligibility = undefined
    repeatClaimData.Visitor = undefined
    repeatClaimData.Prisoner = undefined

    before(function () {
      return knex('IntSchema.Eligibility').insert(existingInternalEligibility)
    })

    it('should copy repeat claim data without external schema eligibility', function () {
      return knex.transaction(function (trx) {
        return copyClaimDataToInternal(repeatClaimData, null, trx)
      })
        .then(function () {
          return knex('IntSchema.Claim').where('IntSchema.Claim.Reference', reference)
            .join('IntSchema.ClaimChild', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimChild.ClaimId')
            .join('IntSchema.ClaimBankDetail', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimBankDetail.ClaimId')
            .join('IntSchema.ClaimExpense', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimExpense.ClaimId')
            .join('IntSchema.ClaimDocument', 'IntSchema.Claim.Reference', '=', 'IntSchema.ClaimDocument.Reference')
            .select()
            .then(function (results) {
              expect(results.length, 'Should have 8 rows, 2x child 2x expense x2 document').to.be.equal(8)
              expect(results[0].Status[0], 'Claim.Status should be NEW').to.be.equal(statusEnum.NEW)
              expect(results[0].Reference[0]).to.be.equal(reference)
            })
        })
    })
  })

  afterEach(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
