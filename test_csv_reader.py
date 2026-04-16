import csv
import os
import tempfile
import pytest
from csv_reader import read_csv, detect_delimiter


@pytest.fixture
def sample_csv():
    """Create a temporary CSV file for testing."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False, newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['name', 'age', 'city'])
        writer.writerow(['Alice', '30', 'NYC'])
        writer.writerow(['Bob', '25', 'LA'])
        writer.writerow(['Charlie', '35', 'Chicago'])
        temp_path = f.name
    yield temp_path
    os.unlink(temp_path)


@pytest.fixture
def empty_csv():
    """Create an empty CSV file for testing."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False, newline='') as f:
        temp_path = f.name
    yield temp_path
    os.unlink(temp_path)


@pytest.fixture
def tab_csv():
    """Create a TSV file for testing."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.tsv', delete=False, newline='') as f:
        f.write('name\tage\tcity\n')
        f.write('Alice\t30\tNYC\n')
        f.write('Bob\t25\tLA\n')
        temp_path = f.name
    yield temp_path
    os.unlink(temp_path)


@pytest.fixture
def pipe_csv():
    """Create a pipe-delimited CSV file for testing."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False, newline='') as f:
        f.write('name|age|city\n')
        f.write('Alice|30|NYC\n')
        f.write('Bob|25|LA\n')
        temp_path = f.name
    yield temp_path
    os.unlink(temp_path)


def test_read_csv_with_data(capsys, sample_csv):
    """Test reading a CSV with data."""
    read_csv(sample_csv)
    captured = capsys.readouterr()
    assert 'Columns:' in captured.out
    assert "['name', 'age', 'city']" in captured.out
    assert 'Total rows: 3' in captured.out
    assert "Row 0:" in captured.out
    assert "Row 1:" in captured.out
    assert "Row 2:" in captured.out


def test_read_csv_empty(capsys, empty_csv):
    """Test reading an empty CSV file."""
    read_csv(empty_csv)
    captured = capsys.readouterr()
    assert 'CSV is empty.' in captured.out


def test_detect_delimiter_comma(sample_csv):
    """Test delimiter detection for comma-separated CSV."""
    delimiter = detect_delimiter(sample_csv)
    assert delimiter == ','


def test_detect_delimiter_tab(tab_csv):
    """Test delimiter detection for tab-separated CSV."""
    delimiter = detect_delimiter(tab_csv)
    assert delimiter == '\t'


def test_detect_delimiter_pipe(pipe_csv):
    """Test delimiter detection for pipe-delimited CSV."""
    delimiter = detect_delimiter(pipe_csv)
    assert delimiter == '|'


def test_read_csv_tab_delimited(capsys, tab_csv):
    """Test reading a tab-delimited CSV file."""
    read_csv(tab_csv)
    captured = capsys.readouterr()
    assert 'Columns:' in captured.out
    assert "['name', 'age', 'city']" in captured.out
    assert 'Total rows: 2' in captured.out


def test_read_csv_pipe_delimited(capsys, pipe_csv):
    """Test reading a pipe-delimited CSV file."""
    read_csv(pipe_csv)
    captured = capsys.readouterr()
    assert 'Columns:' in captured.out
    assert "['name', 'age', 'city']" in captured.out
    assert 'Total rows: 2' in captured.out


if __name__ == "__main__":
    pytest.main([__file__, '-v'])
