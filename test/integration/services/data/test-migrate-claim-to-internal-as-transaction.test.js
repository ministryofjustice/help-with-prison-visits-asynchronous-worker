const { getDatabaseConnector } = require('../../../../app/databaseConnector')

const testHelper = require('../../../test-helper')

const migrateClaimToInternalAsTransaction = require('../../../../app/services/data/migrate-claim-to-internal-as-transaction')

const reference = 'MIGR123'
let claimData
const log = require('../../../../app/services/log')

describe('services/data/migrate-claim-to-internal-as-transaction', () => {
  beforeEach(() => {
    return testHelper
      .deleteAll(reference, 'ExtSchema')
      .then(() => {
        return testHelper.deleteAll(reference, 'IntSchema')
      })
      .then(() => {
        return testHelper.claimMigrationData(reference)
      })
      .then(data => {
        claimData = data
      })
  })

  it('should copy the first time claim data to internal and delete from external', () => {
    return migrateClaimToInternalAsTransaction(
      claimData,
      'first-time',
      claimData.Claim.EligibilityId,
      claimData.Claim.ClaimId,
    ).then(() => {
      const db = getDatabaseConnector()

      return db('IntSchema.Eligibility')
        .where('IntSchema.Eligibility.Reference', reference)
        .join('IntSchema.Prisoner', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Prisoner.EligibilityId')
        .join('IntSchema.Visitor', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
        .join('IntSchema.Claim', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Claim.EligibilityId')
        .select()
        .then(results => {
          expect(results.length).toBe(1)
        })
        .then(() => {
          return db('ExtSchema.Eligibility')
            .where('ExtSchema.Eligibility.Reference', reference)
            .join('ExtSchema.Prisoner', 'ExtSchema.Eligibility.EligibilityId', '=', 'ExtSchema.Prisoner.EligibilityId')
            .join('ExtSchema.Visitor', 'ExtSchema.Eligibility.EligibilityId', '=', 'ExtSchema.Visitor.EligibilityId')
            .join('ExtSchema.Claim', 'ExtSchema.Eligibility.EligibilityId', '=', 'ExtSchema.Claim.EligibilityId')
            .select()
            .then(results => {
              expect(results.length).toBe(0)
            })
        })
    })
  })

  it('should not copy the first time claim data to internal nor delete from external when an error is thrown', () => {
    return testHelper
      .orphanedClaimDocument(claimData.Claim.EligibilityId, claimData.Claim.ClaimId, reference)
      .then(orphanedClaimDocumentData => {
        claimData.ClaimDocument = claimData.ClaimDocument.concat(orphanedClaimDocumentData.ClaimDocument[0])
        return migrateClaimToInternalAsTransaction(
          claimData,
          'first-time',
          claimData.Claim.EligibilityId,
          claimData.Claim.ClaimId,
        ).catch(error => {
          log.error(error)
          const db = getDatabaseConnector()

          return db('IntSchema.Eligibility')
            .where('IntSchema.Eligibility.Reference', reference)
            .select()
            .then(results => {
              expect(results.length).toBe(0)
            })
            .then(() => {
              return db('ExtSchema.Eligibility')
                .where('ExtSchema.Eligibility.Reference', reference)
                .join(
                  'ExtSchema.Prisoner',
                  'ExtSchema.Eligibility.EligibilityId',
                  '=',
                  'ExtSchema.Prisoner.EligibilityId',
                )
                .join(
                  'ExtSchema.Visitor',
                  'ExtSchema.Eligibility.EligibilityId',
                  '=',
                  'ExtSchema.Visitor.EligibilityId',
                )
                .join('ExtSchema.Claim', 'ExtSchema.Eligibility.EligibilityId', '=', 'ExtSchema.Claim.EligibilityId')
                .select()
                .then(results => {
                  expect(results.length).toBe(1)
                })
            })
        })
      })
  })

  afterEach(() => {
    return testHelper.deleteAll(reference, 'ExtSchema').then(() => {
      return testHelper.deleteAll(reference, 'IntSchema')
    })
  })
})
