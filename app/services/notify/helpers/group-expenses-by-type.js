module.exports = function (claimExpenses) {
  var result = { }
  claimExpenses.forEach(function (claimExpense) {
    var list = result[claimExpense.ExpenseType]

    if (list) {
      list.push(claimExpense)
    } else {
      result[claimExpense.ExpenseType] = [claimExpense]
    }
  })

  return result
}
