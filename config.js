module.exports = {
  LOGGING_PATH: process.env.LOGGING_PATH,
  DATA_FILE_PATH: process.env.APVS_DATA_FILE_PATH || './data',
  LOGGING_LEVEL: process.env.LOGGING_LEVEL || 'DEBUG',
  LOGSTASH_HOST: process.env.LOGSTASH_HOST,
  LOGSTASH_PORT: process.env.LOGSTASH_PORT,

  // URL and paths
  EXTERNAL_SERVICE_URL: process.env.APVS_EXTERNAL_SERVICE_URL || 'https://test-apvs-external-web.kainos.com',
  EXTERNAL_PATH_ALREADY_REGISTERED: process.env.APVS_EXTERNAL_PATH_ALREADY_REGISTERED || '/start-already-registered',
  EXTERNAL_PATH_TECHNICAL_HELP: process.env.APVS_EXTERNAL_PATH_TECHNICAL_HELP || '/technical-help',

  // DB
  DATABASE_SERVER: process.env.APVS_DATABASE_SERVER,
  ASYNC_WORKER_USERNAME: process.env.APVS_ASYNC_WORKER_USERNAME,
  ASYNC_WORKER_PASSWORD: process.env.APVS_ASYNC_WORKER_PASSWORD,
  DATABASE: process.env.APVS_DATABASE,
  ARCHIVE_DATABASE: process.env.APVS_ARCHIVE_DATABASE,

  // Worker
  ASYNC_WORKER_CRON: process.env.APVS_ASYNC_WORKER_CRON || '*/5 * * * * *', // default every 5 seconds
  ASYNC_WORKER_BATCH_SIZE: process.env.APVS_ASYNC_WORKER_BATCH_SIZE || '5',
  DAILY_TASKS_CRON: process.env.APVS_DAILY_TASKS_CRON || '00 30 04 * * *', // default every day at 0430
  AUTO_APPROVAL_CRON: process.env.APVS_AUTO_APPROVAL_CRON || '00 00 08 * * 1-5', // default every working day at 0800
  NUMBER_OF_DAYS_AFTER_DATE_OF_JOURNEY_FOR_ADVANCE_REMINDER: process.env.APVS_NUMBER_OF_DAYS_AFTER_DATE_OF_JOURNEY_FOR_ADVANCE_REMINDER || '1',
  NUMBER_OF_DAYS_AFTER_DATE_OF_JOURNEY_FOR_SECOND_ADVANCE_REMINDER: process.env.APVS_NUMBER_OF_DAYS_AFTER_DATE_OF_JOURNEY_FOR_SECOND_ADVANCE_REMINDER || '7',
  ARCHIVE_CLAIMS_AFTER_DAYS: process.env.APVS_ARCHIVE_CLAIMS_AFTER_DAYS || '365',

  // File upload
  FILE_UPLOAD_LOCATION: process.env.FILE_UPLOAD_LOCATION || './uploads',
  FILE_ARCHIVE_LOCATION: process.env.FILE_ARCHIVE_LOCATION || './archive',

  // ZenDesk
  ZENDESK_ENABLED: process.env.APVS_ZENDESK_ENABLED || 'false',
  ZENDESK_TEST_ENVIRONMENT: process.env.APVS_ZENDESK_TEST_ENVIRONMENT || 'true',
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
  NOTIFY_ACCEPTED_CLAIM_PAYOUT_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_ACCEPTED_CLAIM_PAYOUT_EMAIL_TEMPLATE_ID,
  NOTIFY_ACCEPTED_CLAIM_ADVANCE_BANK_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_ACCEPTED_CLAIM_ADVANCE_BANK_EMAIL_TEMPLATE_ID,
  NOTIFY_ACCEPTED_CLAIM_ADVANCE_PAYOUT_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_ACCEPTED_CLAIM_ADVANCE_PAYOUT_EMAIL_TEMPLATE_ID,
  NOTIFY_REJECTED_CLAIM_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_REJECTED_CLAIM_EMAIL_TEMPLATE_ID,
  NOTIFY_REQUEST_INFORMATION_CLAIM_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_REQUEST_INFORMATION_CLAIM_EMAIL_TEMPLATE_ID,
  NOTIFY_REQUEST_INFORMATION_RESPONSE_SUBMITTED_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_REQUEST_INFORMATION_RESPONSE_SUBMITTED_EMAIL_TEMPLATE_ID,
  NOTIFY_SUBMIT_CLAIM_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_SUBMIT_CLAIM_EMAIL_TEMPLATE_ID,
  NOTIFY_ADVANCE_CLAIM_EVIDENCE_REMINDER_TEMPLATE_ID: process.env.APVS_NOTIFY_ADVANCE_CLAIM_EVIDENCE_REMINDER_TEMPLATE_ID,
  NOTIFY_ADVANCE_CLAIM_SECOND_EVIDENCE_REMINDER_TEMPLATE_ID: process.env.APVS_NOTIFY_ADVANCE_CLAIM_SECOND_EVIDENCE_REMINDER_TEMPLATE_ID,
  NOTIFY_MALWARE_UPLOAD_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_MALWARE_UPLOAD_EMAIL_TEMPLATE_ID,
  NOTIFY_SEND_REFERENCE_RECOVERY_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_SEND_REFERENCE_RECOVERY_EMAIL_TEMPLATE_ID,
  NOTIFY_UPDATE_CONTACT_DETAILS_EMAIL_TEMPLATE_ID: process.env.APVS_NOTIFY_UPDATE_CONTACT_DETAILS_EMAIL_TEMPLATE_ID,

  // DWP Benefit Checker
  DWP_BENEFIT_CHECKER_ENABLED: process.env.APVS_DWP_BENEFIT_CHECKER_ENABLED || 'true',
  DWP_BENEFIT_CHECKER_URL: process.env.APVS_DWP_BENEFIT_CHECKER_URL,
  DWP_BENEFIT_CHECKER_LSCSERVICENAME: process.env.APVS_DWP_BENEFIT_CHECKER_LSCSERVICENAME,
  DWP_BENEFIT_CHECKER_CLIENTORGID: process.env.APVS_DWP_BENEFIT_CHECKER_CLIENTORGID,
  DWP_BENEFIT_CHECKER_CLIENTUSERID: process.env.APVS_DWP_BENEFIT_CHECKER_CLIENTUSERID,
  DWP_BENEFIT_CHECKER_CLIENTREFERENCE: process.env.APVS_DWP_BENEFIT_CHECKER_CLIENTREFERENCE,

  // Payment Generation
  PAYMENT_GENERATION_CRON: process.env.APVS_PAYMENT_GENERATION_CRON || '00 05 00 * * 1-5', // default Mon-Fri at 00:05
  PAYMENT_FILE_PATH: process.env.APVS_PAYMENT_FILE_PATH || 'payments',
  PAYMENT_CLEANUP_FILE_NUMBER_OF_DAYS: process.env.APVS_PAYMENT_CLEANUP_FILE_NUMBER_OF_DAYS || '28',
  PAYOUT_TEMPLATE_CODE: process.env.APVS_PAYOUT_TEMPLATE_CODE || 'NOMS1086-LET-003',
  PAYOUT_FILENAME_PREFIX: process.env.APVS_PAYOUT_FILENAME_PREFIX || 'TESTDF_SANTANDERNOMS086_LETTER_',
  PAYOUT_FILENAME_POSTFIX: process.env.APVS_PAYOUT_FILENAME_POSTFIX || '_001_NOMS1',
  PAYOUT_SFTP_ENABLED: process.env.PAYOUT_SFTP_ENABLED || 'false',
  PAYOUT_SFTP_HOST: process.env.PAYOUT_SFTP_HOST,
  PAYOUT_SFTP_PORT: process.env.PAYOUT_SFTP_PORT || '22',
  PAYOUT_SFTP_USER: process.env.PAYOUT_SFTP_USER,
  PAYOUT_SFTP_PASSWORD: process.env.PAYOUT_SFTP_PASSWORD,
  PAYOUT_SFTP_REMOTE_PATH: process.env.PAYOUT_SFTP_REMOTE_PATH || './',

  // Performance Platform metrics
  PERFORMANCE_PLATFORM_SEND_ENABLED: process.env.APVS_PERFORMANCE_PLATFORM_SEND_ENABLED || 'false',
  PERFORMANCE_PLATFORM_URL: process.env.APVS_PERFORMANCE_PLATFORM_URL,
  PERFORMANCE_PLATFORM_BEARER_TOKEN: process.env.APVS_PERFORMANCE_PLATFORM_BEARER_TOKEN,

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
  AUTO_APPROVAL_COST_PER_MILE: process.env.APVS_AUTO_APPROVAL_COST_PER_MILE || '0.13',
  AUTO_APPROVAL_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS: process.env.APVS_AUTO_APPROVAL_NUMBER_OF_CONSECUTIVE_AUTO_APPROVALS || '4',

  // Distance calculation
  DISTANCE_CALCULATION_ENABLED: process.env.APVS_DISTANCE_CALCULATION_ENABLED || 'true',
  DISTANCE_CALCULATION_MAX_MILES: process.env.APVS_DISTANCE_CALCULATION_MAX_MILES || '1500', // 750 each way
  DISTANCE_CALCULATION_DIRECTIONS_API_URL: process.env.APVS_DISTANCE_CALCULATION_DIRECTIONS_API_URL || 'https://maps.googleapis.com/maps/api/directions/json',
  DISTANCE_CALCULATION_DIRECTIONS_API_KEY: process.env.APVS_DISTANCE_CALCULATION_DIRECTIONS_API_KEY, // generate key at https://developers.google.com/maps/documentation/distance-matrix/

  PYTHON_SHELL_ADI_SCRIPT_PATH: process.env.PYTHON_SHELL_ADI_SCRIPT_PATH || '/usr/src/app/apvs-asynchronous-worker/python/adi_generator'
}
