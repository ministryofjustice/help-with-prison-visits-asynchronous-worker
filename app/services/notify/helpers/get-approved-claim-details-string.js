const EXPENSE_TYPE = require('../../../constants/expense-type-enum')
const EXPENSE_STATUS = require('../../../constants/claim-expense-status-enum')
const DEDUCTION_TYPE = require('../../../constants/deduction-type-enum')
const enumHelper = require('../../../constants/helpers/enum-helper')

const newLine = '\r\n'

module.exports = function (claimExpenses, claimDeductions) {
  const paymentBreakdownString = buildPaymentBreakdown(claimExpenses)
  const deductionBreakdownString = buildDeductionBreakdown(claimDeductions)

  return paymentBreakdownString + deductionBreakdownString
}

function getClaimHeader(claimExpense) {
  let claimHeader = ''
  const claimType = EXPENSE_TYPE[claimExpense.ExpenseType]

  if (claimType) {
    if (claimType.isJourney) {
      claimHeader = `${claimType.displayValue} - ${claimExpense.From} to ${claimExpense.To} ${claimExpense.IsReturn ? ' - Return' : ''}`
    } else {
      claimHeader = claimType.displayValue
    }
  } else {
    throw new Error(`Invalid Claim Expense Type: ${claimExpense.ExpenseType}`)
  }

  return claimHeader
}

function buildPaymentBreakdown(claimExpenses) {
  const result = []

  // Append "Your claim details" to top of string if there are any claims expenses to show
  if (claimExpenses.length > 0) {
    result.push('Your claim details')
    result.push(newLine)
  } else {
    return ''
  }

  claimExpenses.forEach(function (claimExpense) {
    const claimHeader = getClaimHeader(claimExpense)

    result.push(claimHeader)
    if (claimExpense.Status !== EXPENSE_STATUS.MANUALLY_PROCESSED) {
      result.push(`Claimed: £${claimExpense.Cost.toFixed(2)}`)
      result.push(`Approved: £${claimExpense.ApprovedCost ? claimExpense.ApprovedCost.toFixed(2) : (0).toFixed(2)}`)
    }
    result.push(newLine)
  })

  result.push(newLine)
  return result.join(newLine)
}

function buildDeductionBreakdown(claimDeductions) {
  const result = []

  if (claimDeductions.length > 0) {
    result.push(newLine)
    result.push('Deductions')
    result.push(newLine)
  } else {
    return ''
  }

  claimDeductions.forEach(function (claimDeduction) {
    const deductionType = enumHelper.getKeyByValue(DEDUCTION_TYPE, claimDeduction.DeductionType)

    result.push(`Type: ${deductionType.displayName}`)
    result.push(`Amount: £${claimDeduction.Amount.toFixed(2)}`)
    result.push(newLine)
  })

  result.push(newLine)
  return result.join(newLine)
}
