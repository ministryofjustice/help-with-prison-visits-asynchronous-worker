const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const statusEnum = require('../../../../app/constants/status-enum')
const testHelper = require('../../../test-helper')

const insertClaimEventStub = jest.fn().mockResolvedValue()
const updateContactDetailsStub = jest.fn().mockResolvedValue()

jest.mock('./insert-claim-event', () => insertClaimEventStub)
jest.mock('./update-contact-details', () => updateContactDetailsStub)

const copyClaimDataToInternal = require('../../../../app/services/data/copy-claim-data-to-internal')

const reference = 'COPY123'
const claimId = 123

describe('services/data/copy-claim-data-to-internal', () => {
  describe('first time claim', () => {
    const firstTimeClaimData = testHelper.getClaimData(reference)

    it('should copy the first time claim data to internal and set status to new', () => {
      const db = getDatabaseConnector()

      return db
        .transaction(trx => {
          return copyClaimDataToInternal(firstTimeClaimData, 'first-time', trx)
        })
        .then(() => {
          return db('IntSchema.Eligibility')
            .where('IntSchema.Eligibility.Reference', reference)
            .join('IntSchema.Prisoner', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Prisoner.EligibilityId')
            .join('IntSchema.Visitor', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
            .join('IntSchema.Claim', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Claim.EligibilityId')
            .join('IntSchema.ClaimBankDetail', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimBankDetail.ClaimId')
            .select()
            .then(results => {
              // Eligibility.Status should be NEW
              expect(results[0].Status[0]).toBe(statusEnum.NEW)
              // Claim.Status should be NEW
              expect(results[0].Status[1]).toBe(statusEnum.NEW)
              expect(results[0].AccountNumber).toBe(firstTimeClaimData.ClaimBankDetail.AccountNumber)
              expect(results[0].NationalInsuranceNumber).toBe(firstTimeClaimData.Visitor.NationalInsuranceNumber)
              expect(results[0].PrisonNumber).toBe(firstTimeClaimData.Prisoner.PrisonNumber)
            })
            .then(() => {
              return db('IntSchema.ClaimChild')
                .where('IntSchema.ClaimChild.Reference', reference)
                .select()
                .then(results => {
                  // should have two children
                  expect(results.length).toBe(2)
                })
            })
            .then(() => {
              return db('IntSchema.ClaimExpense')
                .where('IntSchema.ClaimExpense.Reference', reference)
                .select()
                .then(results => {
                  // should have two expenses
                  expect(results.length).toBe(2)
                  expect(results[0].ExpenseType).toBe('car')
                  expect(results[1].ExpenseType).toBe('bus')
                })
            })
            .then(() => {
              return db('IntSchema.ClaimDocument')
                .where('IntSchema.ClaimDocument.Reference', reference)
                .select()
                .then(results => {
                  // should have two documents
                  expect(results.length).toBe(2)
                })
            })
        })
    })

    it('should change claim status to PENDING if documents not uploaded', () => {
      firstTimeClaimData.ClaimDocument[0].DocumentStatus = 'post-later'
      firstTimeClaimData.ClaimDocument[1].DocumentStatus = 'upload-later'
      const db = getDatabaseConnector()

      return db
        .transaction(trx => {
          return copyClaimDataToInternal(firstTimeClaimData, null, trx)
        })
        .then(() => {
          return db('IntSchema.Claim')
            .where('IntSchema.Claim.Reference', reference)
            .select('Claim.Status')
            .then(results => {
              // Claim.Status should be PENDING
              expect(results[0].Status).toBe(statusEnum.PENDING)
            })
        })
    })
  })

  describe('repeat claim', () => {
    const repeatClaimData = testHelper.getClaimData(reference, claimId)
    const existingInternalEligibility = repeatClaimData.Eligibility
    repeatClaimData.Eligibility = undefined
    repeatClaimData.Visitor = undefined
    repeatClaimData.Prisoner = undefined

    beforeAll(() => {
      const db = getDatabaseConnector()

      return db('IntSchema.Eligibility').insert(existingInternalEligibility)
    })

    it('should copy repeat claim data without external schema eligibility', () => {
      const db = getDatabaseConnector()

      return db
        .transaction(trx => {
          return copyClaimDataToInternal(repeatClaimData, null, trx)
        })
        .then(() => {
          return db('IntSchema.Claim')
            .where('IntSchema.Claim.Reference', reference)
            .join('IntSchema.ClaimChild', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimChild.ClaimId')
            .join('IntSchema.ClaimBankDetail', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimBankDetail.ClaimId')
            .join('IntSchema.ClaimExpense', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimExpense.ClaimId')
            .join('IntSchema.ClaimDocument', 'IntSchema.Claim.Reference', '=', 'IntSchema.ClaimDocument.Reference')
            .select()
            .then(results => {
              // Should have 8 rows, 2x child 2x expense x2 document
              expect(results.length).toBe(8)
              // Claim.Status should be NEW
              expect(results[0].Status[0]).toBe(statusEnum.NEW)
              expect(results[0].Reference[0]).toBe(reference)
            })
        })
    })
  })

  afterEach(() => {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
