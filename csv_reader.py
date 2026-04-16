import csv
import sys

def detect_delimiter(filepath, encoding='utf-8'):
    """Detect the delimiter used in a CSV file."""
    delimiters = [',', '\t', '|', ';', ':']

    with open(filepath, newline='', encoding=encoding) as f:
        sample = f.read(8192)  # Read first 8KB for detection
        f.seek(0)

        try:
            sniffer = csv.Sniffer()
            dialect = sniffer.sniff(sample, delimiters=delimiters)
            return dialect.delimiter
        except csv.Error:
            # Sniffer failed, try counting occurrences in first line
            first_line = sample.split('\n')[0]
            best_delim = ','
            max_count = 0
            for delim in delimiters:
                count = first_line.count(delim)
                if count > max_count:
                    max_count = count
                    best_delim = delim
            return best_delim

def read_csv(filepath, delimiter=None, encoding='utf-8'):
    if delimiter is None:
        delimiter = detect_delimiter(filepath, encoding)

    with open(filepath, newline='', encoding=encoding) as f:
        reader = csv.reader(f, delimiter=delimiter)
        rows = list(reader)

    if not rows:
        print("CSV is empty.")
        return

    # Print header
    print(f"Delimiter: {repr(delimiter)}")
    print(f"Columns: {rows[0]}")
    print(f"Total rows: {len(rows) - 1}\n")

    # Print all rows
    for i, row in enumerate(rows):
        print(f"Row {i}: {row}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python csv_reader.py <file.csv> [delimiter]")
        print("  delimiter is optional - will auto-detect if not provided")
        print("  Common delimiters: ',' (comma), '\\t' (tab), '|' (pipe), ';' (semicolon)")
    else:
        filepath = sys.argv[1]
        delimiter = sys.argv[2] if len(sys.argv) > 2 else None
        if delimiter == '\\t':
            delimiter = '\t'
        read_csv(filepath, delimiter)
