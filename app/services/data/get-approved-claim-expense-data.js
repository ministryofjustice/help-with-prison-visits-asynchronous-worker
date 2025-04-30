const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = claimId => {
  let claimExpenses
  const db = getDatabaseConnector()

  // Get all Claim expenses from database for specified claim id
  return db('IntSchema.ClaimExpense')
    .where('IntSchema.ClaimExpense.ClaimId', claimId)
    .then(claimExpenseData => {
      claimExpenses = claimExpenseData

      return getClaimantData(claimId)
    })
    .then(visitorData => {
      return {
        claimantData: visitorData,
        claimExpenseData: claimExpenses,
      }
    })
}

function getClaimantData(claimId) {
  let visitor
  const db = getDatabaseConnector()

  return db('IntSchema.Visitor')
    .join('IntSchema.Claim', 'IntSchema.Visitor.EligibilityId', '=', 'IntSchema.Claim.EligibilityId')
    .join('IntSchema.Prisoner', 'IntSchema.Visitor.EligibilityId', '=', 'IntSchema.Prisoner.EligibilityId')
    .where('IntSchema.Claim.ClaimId', claimId)
    .select('Visitor.FirstName AS FirstName', 'Note', 'PaymentMethod', 'Town', 'NameOfPrison', 'IsAdvanceClaim')
    .first()
    .then(visitorData => {
      visitor = visitorData
    })
    .then(() => {
      return db('IntSchema.ClaimBankDetail').where('ClaimId', claimId).first()
    })
    .then(bankDetails => {
      const accountNumberLastFourDigits =
        bankDetails && bankDetails.AccountNumber
          ? bankDetails.AccountNumber.substr(bankDetails.AccountNumber.length - 4)
          : ''
      const visitorFirstName = visitor && visitor.FirstName ? visitor.FirstName : ''
      const paymentMethod = visitor && visitor.PaymentMethod ? visitor.PaymentMethod : ''
      const caseworkerNote = visitor && visitor.Note ? visitor.Note : ''
      const town = visitor && visitor.Town ? visitor.Town : ''
      const prison = visitor && visitor.NameOfPrison ? visitor.NameOfPrison : ''
      const isAdvanceClaim = visitor && visitor.IsAdvanceClaim ? visitor.IsAdvanceClaim : ''

      return {
        VisitorFirstName: visitorFirstName,
        PaymentMethod: paymentMethod,
        AccountNumberLastFourDigits: accountNumberLastFourDigits,
        CaseworkerNote: caseworkerNote,
        Town: town,
        Prison: prison,
        IsAdvanceClaim: isAdvanceClaim,
      }
    })
}
