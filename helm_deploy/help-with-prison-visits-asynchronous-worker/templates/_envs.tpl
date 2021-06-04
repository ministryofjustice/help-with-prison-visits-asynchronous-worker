{{/* vim: set filetype=mustache: */}}
{{/*
Environment variables for web and worker containers
*/}}
{{- define "deployment.envs" }}
env:
  - name: APVS_DATABASE
    valueFrom:
      secretKeyRef:
        name: help-with-prison-visits-asynchronous-worker
        key: APVS_DATABASE

  - name: APVS_ASYNC_WORKER_USERNAME
    valueFrom:
      secretKeyRef:
        name: help-with-prison-visits-asynchronous-worker
        key: APVS_ASYNC_WORKER_USERNAME

  - name: APVS_ASYNC_WORKER_PASSWORD
    valueFrom:
      secretKeyRef:
        name: help-with-prison-visits-asynchronous-worker
        key: APVS_ASYNC_WORKER_PASSWORD

  - name: APPINSIGHTS_INSTRUMENTATIONKEY
    valueFrom:
      secretKeyRef:
        name: help-with-prison-visits-asynchronous-worker
        key: APVS_APP_INSIGHTS_INSTRUMENTATION_KEY

  - name: APVS_NOTIFY_API_KEY
    valueFrom:
      secretKeyRef:
        name: help-with-prison-visits-asynchronous-worker
        key: APVS_NOTIFY_API_KEY

  - name: APVS_NOTIFY_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: help-with-prison-visits-asynchronous-worker
        key: APVS_NOTIFY_CLIENT_ID

  - name: PAYOUT_SFTP_USER
    valueFrom:
      secretKeyRef:
        name: help-with-prison-visits-asynchronous-worker
        key: PAYOUT_SFTP_USER

  - name: PAYOUT_SFTP_PASSWORD
    valueFrom:
      secretKeyRef:
        name: help-with-prison-visits-asynchronous-worker
        key: PAYOUT_SFTP_PASSWORD

  - name: APVS_DISTANCE_CALCULATION_DIRECTIONS_API_KEY
    valueFrom:
      secretKeyRef:
        name: help-with-prison-visits-asynchronous-worker
        key: APVS_DISTANCE_CALCULATION_DIRECTIONS_API_KEY

  - name: APVS_DWP_BENEFIT_CHECKER_CLIENTORGID
    valueFrom:
      secretKeyRef:
        name: help-with-prison-visits-asynchronous-worker
        key: APVS_DWP_BENEFIT_CHECKER_CLIENTORGID

  - name: APVS_DWP_BENEFIT_CHECKER_CLIENTREFERENCE
    valueFrom:
      secretKeyRef:
        name: help-with-prison-visits-asynchronous-worker
        key: APVS_DWP_BENEFIT_CHECKER_CLIENTREFERENCE

  - name: APVS_DWP_BENEFIT_CHECKER_CLIENTUSERID
    valueFrom:
      secretKeyRef:
        name: help-with-prison-visits-asynchronous-worker
        key: APVS_DWP_BENEFIT_CHECKER_CLIENTUSERID

  - name: APVS_DWP_BENEFIT_CHECKER_LSCSERVICENAME
    valueFrom:
      secretKeyRef:
        name: help-with-prison-visits-asynchronous-worker
        key: APVS_DWP_BENEFIT_CHECKER_LSCSERVICENAME

  - name: APVS_ZENDESK_API_KEY
    valueFrom:
      secretKeyRef:
        name: help-with-prison-visits-asynchronous-worker
        key: APVS_ZENDESK_API_KEY

  - name: APVS_ZENDESK_EMAIL_ADDRESS
    valueFrom:
      secretKeyRef:
        name: help-with-prison-visits-asynchronous-worker
        key: APVS_ZENDESK_EMAIL_ADDRESS

  - name: APVS_DATABASE_SERVER
    valueFrom:
      secretKeyRef:
        name: rds-sqlserver-instance-output
        key: rds_instance_address

  - name: PAYOUT_SFTP_HOST
    value: {{ .Values.env.PAYOUT_SFTP_HOST | quote }}

  - name: BASIC_AUTH_ENABLED
    value: {{ .Values.env.BASIC_AUTH_ENABLED | quote }}

  - name: APVS_PERFORMANCE_PLATFORM_URL
    value: {{ .Values.env.APVS_PERFORMANCE_PLATFORM_URL | quote }}

  - name: APVS_NOTIFY_API_URL
    value: {{ .Values.env.APVS_NOTIFY_API_URL | quote }}

  - name: APVS_FILE_TMP_DIR
    value: {{ .Values.env.APVS_FILE_TMP_DIR | quote }}

  - name: APVS_NOTIFY_ACCEPTED_CLAIM_ADVANCE_BANK_EMAIL_TEMPLATE_ID
    value: {{ .Values.env.APVS_NOTIFY_ACCEPTED_CLAIM_ADVANCE_BANK_EMAIL_TEMPLATE_ID | quote }}

  - name: APVS_NOTIFY_ACCEPTED_CLAIM_ADVANCE_PAYOUT_EMAIL_TEMPLATE_ID
    value: {{ .Values.env.APVS_NOTIFY_ACCEPTED_CLAIM_ADVANCE_PAYOUT_EMAIL_TEMPLATE_ID | quote }}

  - name: APVS_NOTIFY_ACCEPTED_CLAIM_BANK_EMAIL_TEMPLATE_ID
    value: {{ .Values.env.APVS_NOTIFY_ACCEPTED_CLAIM_BANK_EMAIL_TEMPLATE_ID | quote }}

  - name: APVS_NOTIFY_ACCEPTED_CLAIM_MANUAL_EMAIL_TEMPLATE_ID
    value: {{ .Values.env.APVS_NOTIFY_ACCEPTED_CLAIM_MANUAL_EMAIL_TEMPLATE_ID | quote }}

  - name: APVS_NOTIFY_ACCEPTED_CLAIM_PAYOUT_EMAIL_TEMPLATE_ID
    value: {{ .Values.env.APVS_NOTIFY_ACCEPTED_CLAIM_PAYOUT_EMAIL_TEMPLATE_ID | quote }}

  - name: APVS_NOTIFY_ADVANCE_CLAIM_EVIDENCE_REMINDER_TEMPLATE_ID
    value: {{ .Values.env.APVS_NOTIFY_ADVANCE_CLAIM_EVIDENCE_REMINDER_TEMPLATE_ID | quote }}

  - name: APVS_NOTIFY_ADVANCE_CLAIM_SECOND_EVIDENCE_REMINDER_TEMPLATE_ID
    value: {{ .Values.env.APVS_NOTIFY_ADVANCE_CLAIM_SECOND_EVIDENCE_REMINDER_TEMPLATE_ID | quote }}

  - name: APVS_NOTIFY_MALWARE_UPLOAD_EMAIL_TEMPLATE_ID
    value: {{ .Values.env.APVS_NOTIFY_MALWARE_UPLOAD_EMAIL_TEMPLATE_ID | quote }}

  - name: APVS_NOTIFY_REJECTED_CLAIM_EMAIL_TEMPLATE_ID
    value: {{ .Values.env.APVS_NOTIFY_REJECTED_CLAIM_EMAIL_TEMPLATE_ID | quote }}

  - name: APVS_NOTIFY_REQUEST_INFORMATION_CLAIM_EMAIL_TEMPLATE_ID
    value: {{ .Values.env.APVS_NOTIFY_REQUEST_INFORMATION_CLAIM_EMAIL_TEMPLATE_ID | quote }}

  - name: APVS_NOTIFY_REQUEST_INFORMATION_REMINDER_EMAIL_TEMPLATE_ID
    value: {{ .Values.env.APVS_NOTIFY_REQUEST_INFORMATION_REMINDER_EMAIL_TEMPLATE_ID | quote }}

  - name: APVS_NOTIFY_REQUEST_INFORMATION_RESPONSE_SUBMITTED_EMAIL_TEMPLATE_ID
    value: {{ .Values.env.APVS_NOTIFY_REQUEST_INFORMATION_RESPONSE_SUBMITTED_EMAIL_TEMPLATE_ID | quote }}

  - name: APVS_NOTIFY_SEND_REFERENCE_RECOVERY_EMAIL_TEMPLATE_ID
    value: {{ .Values.env.APVS_NOTIFY_SEND_REFERENCE_RECOVERY_EMAIL_TEMPLATE_ID | quote }}

  - name: APVS_NOTIFY_SUBMIT_CLAIM_EMAIL_TEMPLATE_ID
    value: {{ .Values.env.APVS_NOTIFY_SUBMIT_CLAIM_EMAIL_TEMPLATE_ID | quote }}

  - name: APVS_NOTIFY_UPDATE_CONTACT_DETAILS_EMAIL_TEMPLATE_ID
    value: {{ .Values.env.APVS_NOTIFY_UPDATE_CONTACT_DETAILS_EMAIL_TEMPLATE_ID | quote }}

  - name: APVS_DWP_BENEFIT_CHECKER_ENABLED
    value: {{ .Values.env.APVS_DWP_BENEFIT_CHECKER_ENABLED | quote }}

  - name: APVS_DWP_BENEFIT_CHECKER_URL
    value: {{ .Values.env.APVS_DWP_BENEFIT_CHECKER_URL | quote }}

  - name: APVS_ZENDESK_ENABLED
    value: {{ .Values.env.APVS_ZENDESK_ENABLED | quote }}

  - name: APVS_ZENDESK_API_URL
    value: {{ .Values.env.APVS_ZENDESK_API_URL | quote }}

  - name: APVS_EXTERNAL_SERVICE_URL
    value: {{ .Values.env.APVS_EXTERNAL_SERVICE_URL | quote }}

  - name: PAYOUT_SFTP_ENABLED
    value: {{ .Values.env.PAYOUT_SFTP_ENABLED | quote }}

  - name: PAYOUT_SFTP_REMOTE_PATH
    value: {{ .Values.env.PAYOUT_SFTP_REMOTE_PATH | quote }}

  - name: LOGGING_LEVEL
    value: {{ .Values.env.LOGGING_LEVEL | quote }}
{{- end -}}
