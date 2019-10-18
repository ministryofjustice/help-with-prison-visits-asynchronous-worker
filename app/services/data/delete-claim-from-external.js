module.exports = function (eligibilityId, claimId, trx) {
  return trx('ExtSchema.ClaimBankDetail').where('ClaimId', claimId).del()
    .then(function () {
      return trx('ExtSchema.ClaimDocument')
        .where('ClaimId', claimId).del()
        .orWhere({'ClaimId': null, EligibilityId: eligibilityId})
    })
    .then(function () {
      return trx('ExtSchema.ClaimExpense').where('ClaimId', claimId).del()
    })
    .then(function () {
      return trx('ExtSchema.ClaimChild').where('ClaimId', claimId).del()
    })
    .then(function () {
      return trx('ExtSchema.ClaimEscort').where('ClaimId', claimId).del()
    })
    .then(function () {
      return trx('ExtSchema.EligibilityVisitorUpdateContactDetail').where('EligibilityId', eligibilityId).del()
    })
    .then(function () {
      return trx('ExtSchema.Claim').where('ClaimId', claimId).del()
    })
    .then(function () {
      return trx('ExtSchema.Visitor').where('EligibilityId', eligibilityId).del()
    })
    .then(function () {
      return trx('ExtSchema.Prisoner').where('EligibilityId', eligibilityId).del()
    })
    .then(function () {
      return trx('ExtSchema.Benefit').where('EligibilityId', eligibilityId).del()
    })
    .then(function () {
      return trx('ExtSchema.Eligibility').where('EligibilityId', eligibilityId).del()
    })
}
