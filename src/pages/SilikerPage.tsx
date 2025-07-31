import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';
import { readExcelFileAsArray } from '../utils/excelUtils';
import { processSilikerData, generateSilikerFilename } from '../utils/silikerUtils';

interface ProcessedFile {
  name: string;
  data: (string | number)[][];
  originalName: string;
}

const SilikerPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setProcessedFiles([]);
  };

  const handleClear = () => {
    setFiles([]);
    setProcessedFiles([]);
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const processed: ProcessedFile[] = [];

    try {
      for (const file of files) {
        const data = await readExcelFileAsArray(file);
        const formattedData = processSilikerData(data);
        
        processed.push({
          name: generateSilikerFilename(file.name),
          data: formattedData,
          originalName: file.name
        });
      }
      
      setProcessedFiles(processed);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing files. Please check the file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (processedFile: ProcessedFile) => {
    const ws = XLSX.utils.aoa_to_sheet(processedFile.data);
    
    // Set column widths
    const columnWidths = [
      { wch: 12 }, // SAMPLE_RECD_DATE
      { wch: 20 }, // SAMPLE_DESC1
      { wch: 25 }, // SAMPLE_DESC2
      { wch: 20 }, // METHOD_REFERENCE
      { wch: 25 }, // TEST_REPORTED_NAME
      { wch: 20 }, // RESULT_REPORTED_NAME
      { wch: 15 }, // FORMATTED_ENTRY
      { wch: 10 }, // UNITS
      { wch: 15 }, // COA_NUMBER
      { wch: 12 }  // REPORT_DATE
    ];
    ws['!cols'] = columnWidths;
    
    // Apply date formatting to column A (SAMPLE_RECD_DATE) and column J (REPORT_DATE)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let row = 1; row <= range.e.r; row++) { // Start from row 1 (skip header)
      // Format SAMPLE_RECD_DATE (column A)
      const cellA = `A${row + 1}`;
      if (ws[cellA] && typeof ws[cellA].v === 'number') {
        ws[cellA].t = 'n'; // Keep as number type for Excel
        ws[cellA].z = 'mm/dd/yyyy'; // Set date format
      }
      
      // Format REPORT_DATE (column J)
      const cellJ = `J${row + 1}`;
      if (ws[cellJ] && typeof ws[cellJ].v === 'number') {
        ws[cellJ].t = 'n'; // Keep as number type for Excel
        ws[cellJ].z = 'mm/dd/yyyy'; // Set date format
      }
    }
    
    // Add borders and left alignment to all cells in the data range
    const borderStyle = {
      top: { style: 'thin', color: { auto: 1 } },
      bottom: { style: 'thin', color: { auto: 1 } },
      left: { style: 'thin', color: { auto: 1 } },
      right: { style: 'thin', color: { auto: 1 } }
    };
    
    const alignment = {
      horizontal: 'left',
      vertical: 'top'
    };
    
    for (let row = 0; row <= range.e.r; row++) {
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        
        // Create cell if it doesn't exist
        if (!ws[cellAddress]) {
          ws[cellAddress] = { t: 's', v: '' }; // Create empty string cell
        }
        
        // Apply border style and alignment
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        ws[cellAddress].s.border = borderStyle;
        ws[cellAddress].s.alignment = alignment;
      }
    }
    
    // Add AutoFilter to all columns
    // Note: Data is pre-sorted by column E (TEST_REPORTED_NAME) alphabetically
    // Users can re-sort using Excel's Sort & Filter dropdown arrows
    ws['!autofilter'] = { ref: ws['!ref'] || 'A1' };
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    
    // Ensure the workbook is saved in xlsx format with proper styling support
    XLSX.writeFile(wb, processedFile.name, { 
      bookType: 'xlsx',
      cellStyles: true  // This is crucial for borders and alignment to work!
    });
  };

  const downloadAllFiles = () => {
    processedFiles.forEach(file => downloadFile(file));
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Siliker Formatter</h1>
        <p className="text-lg text-gray-600 mb-8">
          Upload Excel files to format them for Siliker. The tool will extract specific columns and sort the data by sample received date and description.
        </p>
        
        <FileUpload 
          files={files}
          onFilesChange={handleFilesChange}
          accept=".xlsx,.xls"
          multiple={true}
          title="Drag and drop Excel files here"
          description="Select Excel files to format for Siliker"
        />
        
        {files.length > 0 && (
          <FileList 
            files={files}
            onClear={handleClear}
            onProcess={processFiles}
            processing={isProcessing}
            multiple={true}
          />
        )}
        
        {processedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Formatted Files ({processedFiles.length})</h2>
              {processedFiles.length > 1 && (
                <button 
                  onClick={downloadAllFiles} 
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Download All Files
                </button>
              )}
            </div>
            
            <div className="space-y-4 mb-6">
              {processedFiles.map((file, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex justify-between items-center">
                  <div className="text-left">
                    <h3 className="text-lg font-medium text-gray-700">{file.name}</h3>
                    <p className="text-sm text-gray-500">Rows: {file.data.length - 1} (excluding header)</p>
                    <p className="text-sm text-gray-500">Original: {file.originalName}</p>
                  </div>
                  <button 
                    onClick={() => downloadFile(file)}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview: {processedFiles[0].name}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      {processedFiles[0].data[0]?.map((header: string | number, index: number) => (
                        <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {processedFiles[0].data.slice(1, 11).map((row: (string | number)[], rowIndex: number) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {row.map((cell: string | number, cellIndex: number) => (
                          <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 border-b">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {processedFiles[0].data.length > 11 && (
                  <p className="text-sm text-gray-500 mt-2">Showing first 10 rows. Download file to see all data.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SilikerPage;