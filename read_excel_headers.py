
import pandas as pd
import sys

try:
    # Attempt to read the excel file
    df = pd.read_excel('assets/Consumer Sample.xlsx', nrows=0)
    print("Columns:", df.columns.tolist())
except Exception as e:
    print(f"Error reading excel: {e}")
