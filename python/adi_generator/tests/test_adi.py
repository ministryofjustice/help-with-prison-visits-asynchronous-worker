
from adi_generator.adi import update_journal_total
import unittest
from openpyxl import Workbook

class AdiJournalTestCase(unittest.TestCase):
    """
    TestCase for testing Adi Journal generation code
    """

    def test_update_journal_total(self):
        """ Test workbook updated as expected """
        total = 123.45
        accountingDate = '12 Dec 2018'
        workbook = Workbook()
        workbook.create_sheet(0, 'TEMPLATE')
        update_journal_total(workbook, total, accountingDate)
        self.assertEqual(workbook['TEMPLATE']['K19'].value, total)

if __name__ == '__main__':
    unittest.main()
