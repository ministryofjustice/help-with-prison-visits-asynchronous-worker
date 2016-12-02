const EXPENSE_TYPE = require('../../../constants/expense-type-enum')

module.exports = function (claims) {
  var result = []
  var newLine = '\r\n'

  // Append "Your claim details" to top of string if there are any claims expenses to show
  if (claims.length > 0) {
    result.push('Your claim details')
    result.push(newLine)
  } else {
    return ''
  }

  claims.forEach(function (claim) {
    var claimHeader = getClaimHeader(claim)

    result.push(claimHeader)
    result.push(`Claimed: £${claim.Cost.toFixed(2)}`)
    result.push(`Approved: £${(claim.ApprovedCost ? claim.ApprovedCost.toFixed(2) : (0).toFixed(2))}`)
    result.push(newLine)
  })

  return result.join(newLine)
}

function getClaimHeader (claim) {
  var claimHeader = ''
  var claimType = EXPENSE_TYPE[claim.ExpenseType]

  if (claimType) {
    if (claimType.isJourney) {
      claimHeader = `${claimType.displayValue} - ${claim.From} to ${claim.To} ${(claim.IsReturn ? ' - Return' : '')}`
    } else {
      claimHeader = claimType.displayValue
    }
  } else {
    throw new Error(`Invalid Claim Expense Type: ${claim.ExpenseType}`)
  }

  return claimHeader
}
