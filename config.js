require('dotenv').config()

module.exports = {
  LOGGING_PATH: process.env.LOGGING_PATH,
  LOGGING_LEVEL: process.env.LOGGING_LEVEL || 'DEBUG',
  LOGSTASH_HOST: process.env.LOGSTASH_HOST,
  LOGSTASH_PORT: process.env.LOGSTASH_PORT,
  FILE_TMP_DIR: process.env.APVS_FILE_TMP_DIR || '/app/tmp',

  // URL and paths
  EXTERNAL_SERVICE_URL:
    process.env.APVS_EXTERNAL_SERVICE_URL || 'https://help-with-prison-visits-dev.service.justice.gov.uk',
  EXTERNAL_PATH_ALREADY_REGISTERED: process.env.APVS_EXTERNAL_PATH_ALREADY_REGISTERED || '/start-already-registered',
  EXTERNAL_PATH_TECHNICAL_HELP: process.env.APVS_EXTERNAL_PATH_TECHNICAL_HELP || '/technical-help',

  // DB
  DATABASE_SERVER: process.env.APVS_DATABASE_SERVER,
  ASYNC_WORKER_USERNAME: process.env.APVS_ASYNC_WORKER_USERNAME,
  ASYNC_WORKER_PASSWORD: process.env.APVS_ASYNC_WORKER_PASSWORD,
  DATABASE: process.env.APVS_DATABASE,
  ARCHIVE_DATABASE: process.env.APVS_ARCHIVE_DATABASE,
  TESTING_DATABASE_SERVER: process.env.HWPV_TESTING_DATABASE_SERVER,
  TESTING_DATABASE: process.env.HWPV_TESTING_DATABASE,
  TESTING_USERNAME: process.env.HWPV_TESTING_USERNAME,
  TESTING_PASSWORD: process.env.HWPV_TESTING_PASSWORD,
  KNEX_CONFIG: process.env.KNEX_CONFIG || 'asyncworker',

  // Worker
  ASYNC_WORKER_BATCH_SIZE: process.env.APVS_ASYNC_WORKER_BATCH_SIZE || '10',
  AUTO_APPROVAL_CRON: process.env.APVS_AUTO_APPROVAL_CRON || '00 00 10 * * 1-5', // default every working day at 1000 (0 10 * * 1-5) NOT CURRENTLY USED
  NUMBER_OF_DAYS_AFTER_DATE_OF_JOURNEY_FOR_ADVANCE_REMINDER:
    process.env.APVS_NUMBER_OF_DAYS_AFTER_DATE_OF_JOURNEY_FOR_ADVANCE_REMINDER || '1',
  NUMBER_OF_DAYS_AFTER_DATE_OF_JOURNEY_FOR_SECOND_ADVANCE_REMINDER:
    process.env.APVS_NUMBER_OF_DAYS_AFTER_DATE_OF_JOURNEY_FOR_SECOND_ADVANCE_REMINDER || '7',
  NUMBER_OF_DAYS_PENDING_FOR_FINAL_REMINDER: process.env.APVS_NUMBER_OF_DAYS_PENDING_FOR_FINAL_REMINDER || '35',
  NUMBER_OF_DAYS_AFTER_FINAL_REMINDER_FOR_REJECTION:
    process.env.APVS_NUMBER_OF_DAYS_AFTER_FINAL_REMINDER_FOR_REJECTION || '7',
  ARCHIVE_CLAIMS_AFTER_DAYS: process.env.APVS_ARCHIVE_CLAIMS_AFTER_DAYS || '365',
  AUTO_REJECT_AFTER_WEEKS: process.env.APVS_AUTO_REJECT_AFTER_WEEKS || '6',

  // ZenDesk
  ZENDESK_ENABLED: process.env.APVS_ZENDESK_ENABLED || 'false',
  ZENDESK_PROD_ENVIRONMENT: process.env.APVS_ZENDESK_PROD_ENVIRONMENT || 'false',
  ZENDESK_API_URL: process.env.APVS_ZENDESK_API_URL,
  ZENDESK_API_KEY: process.env.APVS_ZENDESK_API_KEY,
  ZENDESK_EMAIL_ADDRESS: process.env.APVS_ZENDESK_EMAIL_ADDRESS,

  // GOV Notify
  NOTIFY_API_URL: process.env.APVS_NOTIFY_API_URL || 'https://api.notifications.service.gov.uk',
  NOTIFY_API_KEY: process.env.APVS_NOTIFY_API_KEY,
  NOTIFY_CLIENT_ID: process.env.APVS_NOTIFY_CLIENT_ID,
  NOTIFY_DO_NOT_SEND_EMAIL: process.env.APVS_NOTIFY_DO_NOT_SEND_EMAIL || 'donotsend@apvs.com',
  APVS_TEST_EMAIL_ADDRESS: process.env.APVS_TEST_EMAIL_ADDRESS,

  // GOV Notify template IDs
  NOTIFY_ACCEPTED_CLAIM_BANK_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_ACCEPTED_CLAIM_BANK_EMAIL_TEMPLATE_ID,
  NOTIFY_ACCEPTED_CLAIM_ADVANCE_BANK_EMAIL_TEMPLATE_ID:
    process.env.APVS_NOTIFY_ACCEPTED_CLAIM_ADVANCE_BANK_EMAIL_TEMPLATE_ID,
  NOTIFY_REJECTED_CLAIM_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_REJECTED_CLAIM_EMAIL_TEMPLATE_ID,
  NOTIFY_REQUEST_INFORMATION_CLAIM_EMAIL_TEMPLATE_ID:
    process.env.APVS_NOTIFY_REQUEST_INFORMATION_CLAIM_EMAIL_TEMPLATE_ID,
  NOTIFY_REQUEST_INFORMATION_REMINDER_EMAIL_TEMPLATE_ID:
    process.env.APVS_NOTIFY_REQUEST_INFORMATION_REMINDER_EMAIL_TEMPLATE_ID,
  NOTIFY_REQUEST_INFORMATION_RESPONSE_SUBMITTED_EMAIL_TEMPLATE_ID:
    process.env.APVS_NOTIFY_REQUEST_INFORMATION_RESPONSE_SUBMITTED_EMAIL_TEMPLATE_ID,
  NOTIFY_SUBMIT_CLAIM_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_SUBMIT_CLAIM_EMAIL_TEMPLATE_ID,
  NOTIFY_ADVANCE_CLAIM_EVIDENCE_REMINDER_TEMPLATE_ID:
    process.env.APVS_NOTIFY_ADVANCE_CLAIM_EVIDENCE_REMINDER_TEMPLATE_ID,
  NOTIFY_ADVANCE_CLAIM_SECOND_EVIDENCE_REMINDER_TEMPLATE_ID:
    process.env.APVS_NOTIFY_ADVANCE_CLAIM_SECOND_EVIDENCE_REMINDER_TEMPLATE_ID,
  NOTIFY_MALWARE_UPLOAD_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_MALWARE_UPLOAD_EMAIL_TEMPLATE_ID,
  NOTIFY_SEND_REFERENCE_RECOVERY_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_SEND_REFERENCE_RECOVERY_EMAIL_TEMPLATE_ID,
  NOTIFY_UPDATE_CONTACT_DETAILS_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_UPDATE_CONTACT_DETAILS_EMAIL_TEMPLATE_ID,
  NOTIFY_ACCEPTED_CLAIM_MANUAL_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_ACCEPTED_CLAIM_MANUAL_EMAIL_TEMPLATE_ID,

  // DWP Benefit Checker
  DWP_BENEFIT_CHECKER_ENABLED: process.env.APVS_DWP_BENEFIT_CHECKER_ENABLED || 'false',
  DWP_BENEFIT_CHECKER_URL: process.env.APVS_DWP_BENEFIT_CHECKER_URL,
  DWP_BENEFIT_CHECKER_LSCSERVICENAME: process.env.APVS_DWP_BENEFIT_CHECKER_LSCSERVICENAME,
  DWP_BENEFIT_CHECKER_CLIENTORGID: process.env.APVS_DWP_BENEFIT_CHECKER_CLIENTORGID,
  DWP_BENEFIT_CHECKER_CLIENTUSERID: process.env.APVS_DWP_BENEFIT_CHECKER_CLIENTUSERID,
  DWP_BENEFIT_CHECKER_CLIENTREFERENCE: process.env.APVS_DWP_BENEFIT_CHECKER_CLIENTREFERENCE,

  // Payment Generation
  PAYMENT_CLEANUP_FILE_NUMBER_OF_DAYS: process.env.APVS_PAYMENT_CLEANUP_FILE_NUMBER_OF_DAYS || '28',
  PAYOUT_TEMPLATE_CODE: process.env.APVS_PAYOUT_TEMPLATE_CODE || 'NOMS1086-LET-003',
  PAYOUT_FILENAME_PREFIX: process.env.APVS_PAYOUT_FILENAME_PREFIX || 'TESTDF_SANTANDERNOMS086_LETTER_',
  PAYOUT_FILENAME_POSTFIX: process.env.APVS_PAYOUT_FILENAME_POSTFIX || '_001_NOMS1',

  // Advance Claim mark as overpayment
  MARK_AS_OVERPAYMENT_DAYS: process.env.APVS_MARK_AS_OVERPAYMENT_DAYS || '10',

  // Cleanup task for external data
  EXTERNAL_MAX_DAYS_BEFORE_DELETE_OLD_DATA: process.env.APVS_EXTERNAL_MAX_DAYS_BEFORE_DELETE_OLD_DATA || '30',

  // Auto approval config defaults
  AUTO_APPROVAL_ENABLED: process.env.APVS_AUTO_APPROVAL_ENABLED || 'true',
  AUTO_APPROVAL_COST_VARIANCE: process.env.APVS_AUTO_APPROVAL_COST_VARIANCE || '10',
  AUTO_APPROVAL_MAX_CLAIM_TOTAL: process.env.APVS_AUTO_APPROVAL_MAX_CLAIM_TOTAL || '250',
  AUTO_APPROVAL_MAX_DAYS_AFTER_APVU_VISIT: process.env.APVS_AUTO_APPROVAL_MAX_DAYS_AFTER_APVU_VISIT || '28',
  AUTO_APPROVAL_MAX_CLAIMS_PER_YEAR: process.env.APVS_AUTO_APPROVAL_MAX_CLAIMS_PER_YEAR || '26',
  AUTO_APPROVAL_MAX_CLAIMS_PER_MONTH: process.env.APVS_AUTO_APPROVAL_MAX_CLAIMS_PER_MONTH || '4',
  AUTO_APPROVAL_COST_PER_MILE: process.env.APVS_AUTO_APPROVAL_COST_PER_MILE || '0.30',
  AUTO_APPROVAL_COST_PER_MILE_ENGWAL: process.env.APVS_AUTO_APPROVAL_COST_PER_MILE_ENGWAL || '0.20',
  AUTO_APPROVAL_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS:
    process.env.APVS_AUTO_APPROVAL_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS || '4',

  // Distance calculation
  DISTANCE_CALCULATION_ENABLED: process.env.APVS_DISTANCE_CALCULATION_ENABLED || 'true',
  DISTANCE_CALCULATION_MAX_MILES: process.env.APVS_DISTANCE_CALCULATION_MAX_MILES || '1500', // 750 each way
  DISTANCE_CALCULATION_DIRECTIONS_API_URL:
    process.env.APVS_DISTANCE_CALCULATION_DIRECTIONS_API_URL || 'https://maps.googleapis.com/maps/api/directions/json',
  DISTANCE_CALCULATION_DIRECTIONS_API_KEY: process.env.APVS_DISTANCE_CALCULATION_DIRECTIONS_API_KEY, // generate key at https://developers.google.com/maps/documentation/distance-matrix/

  // Azure App Insights
  APP_INSIGHTS_INSTRUMENTATION_KEY: process.env.APVS_APP_INSIGHTS_INSTRUMENTATION_KEY,

  // ADI Journal
  ADI_JOURNAL_PREFIX: process.env.APVS_ADI_JOURNAL_PREFIX || '578/APVU/',
  ADI_JOURNAL_SUFFIX: process.env.APVS_ADI_JOURNAL_SUFFIX || '/EB',
  ADI_TEMPLATE_PATH: process.env.APVS_ADI_TEMPLATE_PATH || '/app/app/templates/adi_template.xlsm',
  ADI_JOURNAL_SHEET: process.env.APVS_ADI_JOURNAL_SHEET || 'WebADI',
  ADI_TOTAL_CELL: process.env.APVS_ADI_TOTAL_CELL || 'K20',
  ADI_DEBIT_CELL: process.env.APVS_ADI_DEBIT_CELL || 'J19',
  ADI_ACCOUNTING_DATE_CELL: process.env.APVS_ADI_ACCOUNTING_DATE_CELL || 'E12',
  ADI_PERIOD_CELL: process.env.APVS_ADI_PERIOD_CELL || 'E13',
  ADI_JOURNAL_NAME_CELL: process.env.APVS_ADI_JOURNAL_NAME_CELL || 'E14',
  ADI_JOURNAL_DESCRIPTION_CELL: process.env.APVS_ADI_JOURNAL_DESCRIPTION_CELL || 'E15',

  // S3
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
  AWS_REGION: process.env.AWS_REGION || 'eu-west-2',
}
