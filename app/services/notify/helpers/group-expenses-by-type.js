module.exports = function (claimExpenses) {
  if (!claimExpenses || claimExpenses.length === 0) {
    return {}
  }

  const result = {}
  for (let i = 0; i < claimExpenses.length; i += 1) {
    const claimExpense = claimExpenses[i]
    const list = result[claimExpense.ExpenseType]

    if (list) {
      list.push(claimExpense)
    } else {
      result[claimExpense.ExpenseType] = [claimExpense]
    }
  }

  return result
}
