module.exports = (eligibilityId, claimId, trx) => {
  return trx('ExtSchema.ClaimBankDetail')
    .where('ClaimId', claimId)
    .del()
    .then(() => {
      return trx('ExtSchema.ClaimDocument')
        .where('ClaimId', claimId)
        .del()
        .orWhere({ ClaimId: null, EligibilityId: eligibilityId })
    })
    .then(() => {
      return trx('ExtSchema.ClaimExpense').where('ClaimId', claimId).del()
    })
    .then(() => {
      return trx('ExtSchema.ClaimChild').where('ClaimId', claimId).del()
    })
    .then(() => {
      return trx('ExtSchema.ClaimEscort').where('ClaimId', claimId).del()
    })
    .then(() => {
      return trx('ExtSchema.EligibilityVisitorUpdateContactDetail').where('EligibilityId', eligibilityId).del()
    })
    .then(() => {
      return trx('ExtSchema.Claim').where('ClaimId', claimId).del()
    })
    .then(() => {
      return trx('ExtSchema.Visitor').where('EligibilityId', eligibilityId).del()
    })
    .then(() => {
      return trx('ExtSchema.Prisoner').where('EligibilityId', eligibilityId).del()
    })
    .then(() => {
      return trx('ExtSchema.Benefit').where('EligibilityId', eligibilityId).del()
    })
    .then(() => {
      return trx('ExtSchema.EligibleChild').where('EligibilityId', eligibilityId).del()
    })
    .then(() => {
      return trx('ExtSchema.Eligibility').where('EligibilityId', eligibilityId).del()
    })
}
