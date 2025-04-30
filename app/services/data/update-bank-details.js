const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = (claimBankDetailId, reference, claimId, sortcode, accountNumber, nameOnAccount, rollNumber) => {
  const db = getDatabaseConnector()

  return db('IntSchema.ClaimBankDetail')
    .where({ ClaimBankDetailId: claimBankDetailId, Reference: reference, ClaimId: claimId })
    .update({ SortCode: sortcode, AccountNumber: accountNumber, NameOnAccount: nameOnAccount, RollNumber: rollNumber })
}
