export interface SilikerRow {
  SAMPLE_RECD_DATE: number | string;
  SAMPLE_DESC1: string;
  SAMPLE_DESC2: string;
  METHOD_REFERENCE: string;
  TEST_REPORTED_NAME: string;
  RESULT_REPORTED_NAME: string;
  FORMATTED_ENTRY: string | number;
  UNITS: string;
  COA_NUMBER: string;
  REPORT_DATE: number | string;
}

const SILIKER_OUTPUT_COLUMNS = [
  'SAMPLE_RECD_DATE',
  'SAMPLE_DESC1',
  'SAMPLE_DESC2',
  'METHOD_REFERENCE',
  'TEST_REPORTED_NAME',
  'RESULT_REPORTED_NAME',
  'FORMATTED_ENTRY',
  'UNITS',
  'COA_NUMBER',
  'REPORT_DATE'
] as const;

export function processSilikerData(data: (string | number)[][]): (string | number)[][] {
  if (data.length === 0) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  // Find column indices for the output columns
  const columnIndices: { [key: string]: number } = {};
  SILIKER_OUTPUT_COLUMNS.forEach(col => {
    const index = headers.indexOf(col);
    if (index !== -1) {
      columnIndices[col] = index;
    }
  });
  
  // Extract and transform data rows
  const transformedRows = rows.map(row => {
    return SILIKER_OUTPUT_COLUMNS.map(col => {
      const index = columnIndices[col];
      if (index === undefined) return '';
      
      const value = row[index];
      
      // Keep date columns as numbers for proper Excel date formatting
      if ((col === 'SAMPLE_RECD_DATE' || col === 'REPORT_DATE') && typeof value === 'number') {
        return value;
      }
      
      return value || '';
    });
  });
  
  // Sort by TEST_REPORTED_NAME (column E) alphabetically ascending as primary sort
  transformedRows.sort((a, b) => {
    const testNameA = String(a[4] || ''); // TEST_REPORTED_NAME is fifth column (index 4)
    const testNameB = String(b[4] || '');
    const dateA = a[0]; // SAMPLE_RECD_DATE is first column
    const dateB = b[0];
    const desc1A = String(a[1] || ''); // SAMPLE_DESC1 is second column
    const desc1B = String(b[1] || '');
    
    // Primary sort by TEST_REPORTED_NAME alphabetically
    if (testNameA !== testNameB) {
      return testNameA.localeCompare(testNameB);
    }
    
    // Secondary sort by date
    if (dateA !== dateB) {
      return Number(dateA) - Number(dateB);
    }
    
    // Tertiary sort by description
    return desc1A.localeCompare(desc1B);
  });
  
  // Return with headers
  return [SILIKER_OUTPUT_COLUMNS.slice() as (string | number)[], ...transformedRows];
}

export function generateSilikerFilename(originalFilename: string): string {
  return `FORMATTED-${originalFilename}`;
}