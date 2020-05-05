
from openpyxl.styles import PatternFill
import os

ADI_JOURNAL_SHEET = 'WebADI'
ADI_TEMPLATE_FILEPATH = os.getenv('APVS_ADI_TEMPLATE_PATH', '/data/templates/adi_template.xlsm')
ADI_TOTAL_CELL = 'K20'
ADI_DEBIT_CELL = 'J19'
ADI_ACCOUNTING_DATE_CELL = 'E12'
ADI_PERIOD_CELL = 'E13'
ADI_JORNAL_NAME_CELL = 'E14'
