# FML Tools

A collection of laboratory tools for file processing and data management.

## Features

### GeneUP CSV Generator (`/geneup`)
- Process Excel files containing sample and test data
- Automatically categorize samples by assay type (SLM, ECO, EH1, LIS, LMO)
- Generate CSV files organized by assay for GeneUP testing
- Support for multiple file processing
- Download individual or all CSV files

### QC Print Generator (`/qc`)
- Process Excel files for QC reporting
- Sort data alphabetically by columns
- Generate print-ready reports with organized data tables
- Optimized for A4 printing with proper page breaks
- Two-column layout for efficient space usage

### Water Potability Tracer Log (`/water-potability`)
- Read CSV or Excel input containing `Test Name` and `Sample Num`
- Collect the fields required by each supported test for every sample
- Generate `Water Potability Tracer Log Form 136 v.100526.xlsx`

## Getting Started

### Prerequisites
- Node.js (version 20.19.0 or higher, or 22.12.0+)
- pnpm

### Installation
```bash
pnpm install
```

### Development
```bash
pnpm dev
```

### Build
```bash
pnpm build
```

### Lint
```bash
pnpm lint
```

## Usage

1. Navigate to the application in your browser
2. Use the navigation bar to switch between tools:
   - **GeneUP CSV Generator**: `/geneup`
    - **QC Print Generator**: `/qc`
    - **Water Potability Tracer Log**: `/water-potability`
3. Upload Excel files using drag-and-drop or file selection
4. Process files and download results

## File Formats

### GeneUP CSV Generator
- **Input**: Excel files (.xlsx, .xls) with columns:
  - Sample Num
  - Test Name
  - Additional columns (Print, Run, Process Group Num, etc.)
- **Output**: CSV files organized by assay type

### QC Print Generator
- **Input**: Excel files (.xlsx, .xls) with data in columns B and C
- **Output**: Print-ready HTML tables optimized for A4 paper

### Water Potability Tracer Log
- **Input**: CSV or Excel file with `Test Name` and `Sample Num` columns
- **Supported tests**: `Coliforms & E. coli - Colitag v.8` and `HPC-0,1 v.3`
- **Output**: Versioned Excel tracer log with the two test tables stacked vertically

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Navigation.tsx   # Main navigation bar
│   ├── FileUpload.tsx   # File upload component
│   ├── FileList.tsx     # File list display
│   └── QcPrintView.tsx  # QC print preview component
├── pages/               # Page components
│   ├── Home.tsx         # Landing page
│   ├── GeneupPage.tsx   # GeneUP tool page
│   └── QcPage.tsx       # QC tool page
├── utils/               # Utility functions
│   ├── excelUtils.ts    # Excel file processing utilities
│   ├── geneupUtils.ts   # GeneUP-specific logic
│   └── qcUtils.ts       # QC-specific logic
├── App.tsx              # Main app component with routing
├── main.tsx             # Application entry point
└── index.css            # Global styles including print styles
```

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **XLSX** - Excel file processing

## Routes

- `/` - Home page with tool selection
- `/geneup` - GeneUP CSV Generator
- `/qc` - QC Print Generator
- `/water-potability` - Water Potability Tracer Log Form 136 v.100526

## Migration Notes

This project combines two previously separate applications:
- `../geneup-csv-gen` - GeneUP CSV Generator functionality
- `../qc-print` - QC Print Generator functionality

All original formatting logic and file processing logic has been preserved during the migration. Reusable components have been extracted for shared functionality like file uploads and processing.
