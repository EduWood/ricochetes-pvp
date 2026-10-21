# Python | test_setup.py | Python 3.10+ | local setup verification
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import app


class SetupTests(unittest.TestCase):
    def test_embedded_files_extract_exactly_and_repeatably(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'extension'
            first = app.extract(target)
            self.assertEqual(first, app.extract(target))
            for name in app.FILES:
                self.assertEqual((target / name).read_bytes(), (app.RESOURCE / name).read_bytes())
            self.assertEqual(len(list(target.iterdir())), len(app.FILES))

    def test_browser_is_not_started_during_extraction(self):
        with tempfile.TemporaryDirectory() as directory, patch('os.startfile', side_effect=AssertionError('unexpected application launch')):
            app.extract(Path(directory))
        manifest = json.loads((app.RESOURCE / 'manifest.json').read_text(encoding='utf-8'))
        self.assertEqual(manifest['version'], app.VERSION)
        self.assertNotIn('debugger', manifest['permissions'])
        self.assertNotIn('cookies', manifest['permissions'])


if __name__ == '__main__':
    unittest.main()
