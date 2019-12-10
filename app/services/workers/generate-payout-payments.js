const getClaimsPendingPayment = require('../data/get-claims-pending-payment')
const getTopUpsPendingPayment = require('../data/get-topups-pending-payment')
const createPayoutFile = require('../payout-payments/create-payout-file')
const sftpSendPayoutPaymentFile = require('../sftp/sftp-send-payout-payment-file')
const updateClaimsProcessedPayment = require('../data/update-claims-processed-payment')
const updateTopupsProcessedPayment = require('../data/update-topups-processed-payment')
const insertDirectPaymentFile = require('../data/insert-direct-payment-file')
const fileTypes = require('../../constants/payment-filetype-enum')
const paymentMethods = require('../../constants/payment-method-enum')
const config = require('../../../config')
const _ = require('lodash')
const path = require('path')
const dateFormatter = require('../date-formatter')

module.exports._test_formatCSVData = formatCSVData

module.exports.execute = function (task) {
  var claimIds
  var topUpClaimIds
  var paymentCsvFilePath

  return getClaimsPendingPayment(paymentMethods.PAYOUT.value)
    .then(function (paymentData) {
      return getTopUpsPendingPayment(paymentMethods.PAYOUT.value)
        .then(function (topupData) {
          if (paymentData.length + topupData.length > 0) {
            var claimIdIndex = 0
            claimIds = getClaimIdsFromPaymentData(paymentData, claimIdIndex)
            topUpClaimIds = getClaimIdsFromPaymentData(topupData, claimIdIndex)
            topupData.forEach(function (topup) {
              paymentData.push(topup)
            })
            formatCSVData(paymentData, claimIdIndex)
            return createPayoutFile(paymentData)
              .then(function (filePath) {
                paymentCsvFilePath = filePath
                var filename = path.basename(paymentCsvFilePath)
                var remotePaypitCsvFilePath = `${config.PAYOUT_SFTP_REMOTE_PATH}${filename}`

                return sftpSendPayoutPaymentFile(paymentCsvFilePath, remotePaypitCsvFilePath)
              })
              .then(function () {
                return insertDirectPaymentFile(paymentCsvFilePath, fileTypes.PAYOUT_FILE)
                  .then(function () {
                    return updateAllClaimsProcessedPayment(claimIds, paymentData)
                      .then(function () {
                        return updateAllTopupsProcessedPayment(topUpClaimIds)
                      })
                  })
              })
          }
        })
    })
}

function getClaimIdsFromPaymentData (paymentData, claimIdIndex) {
  return _.map(paymentData, p => { return p[claimIdIndex] })
}

// Format to be Payment Amount, blank, First Name, Last Name, Address1, Address2, Address3, Address4, Postcode,
// POI code, blank, blank, Reference, blank, blank, blank, blank, blank, template code
function formatCSVData (paymentData, claimIdIndex) {
  paymentData.forEach(function (data) {
    data.splice(claimIdIndex, 1)
    data.splice(1, 0, '')
    data.splice(9, 0, '2', '', '') // 2 is the code for checking ID in POI
    data.splice(13, 0, '', '', '', '', '', config.PAYOUT_TEMPLATE_CODE)

    // Ensures there is a space in the postcode
    var postCodeIndex = 8
    if (data[postCodeIndex].indexOf(' ') < 0) {
      data[postCodeIndex] = data[postCodeIndex].replace(/^(.*)(.{3})$/, '$1 $2')
    }
  })

  return paymentData
}

// Makes it specific layout for post office payout

function updateAllClaimsProcessedPayment (claimIds, paymentData) {
  var promises = []

  var now = dateFormatter.now().toDate()

  for (var i = 0; i < claimIds.length; i++) {
    var claimPaymentData = paymentData[i]
    var claimId = claimIds[i]

    var totalApprovedCostIndex = 0
    promises.push(updateClaimsProcessedPayment(claimId, parseFloat(claimPaymentData[totalApprovedCostIndex]), now))
  }

  return Promise.all(promises)
}

function updateAllTopupsProcessedPayment (topUpIds) {
  var promises = []

  var now = dateFormatter.now().toDate()

  for (var i = 0; i < topUpIds.length; i++) {
    var topUpId = topUpIds[i]
    promises.push(updateTopupsProcessedPayment(topUpId, now))
  }

  return Promise.all(promises)
}
