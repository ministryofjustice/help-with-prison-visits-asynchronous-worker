
import argparse
import adi_config as config
from openpyxl import load_workbook

def main():
    """ Main application entrypoint """
    parser = argparse.ArgumentParser(
        description='Output a sample ADI journal based on input payment total'
    )

    parser.add_argument(
        'total',
        help='Journal total credit amount'
    )

    parser.add_argument(
        'filePath',
        help='Journal filepath'
    )

    args = parser.parse_args()
    write_journal(args.total, args.filePath)

def write_journal(total, filepath):
    """ Update and save ADI Journal file to disk """
    workbook = load_workbook(config.ADI_TEMPLATE_FILEPATH, keep_vba=True)
    update_journal_total(workbook, total)
    workbook.save(filename=filepath)

def update_journal_total(workbook, total):
    """ Update the Journal account date"""
    journal_ws = workbook[config.ADI_JOURNAL_SHEET]

    """ Update the two template rows to debit/credit the total amount """
    total_cell = journal_ws[config.ADI_TOTAL_CELL]
    total_cell.value = total

    debit_cell = journal_ws[config.ADI_DEBIT_CELL]
    debit_cell.value = total

if __name__ == '__main__':
    main()
