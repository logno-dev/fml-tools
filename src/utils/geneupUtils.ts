import { readExcelFile, ExcelRow } from './excelUtils'

export interface GeneupExcelRow extends ExcelRow {
  'Sample Num': string
  'Test Name': string
  'Print'?: string
  'Run'?: string
  'Process Group Num'?: string
  'Process Name'?: string
  'Received Date'?: string
  'Expiration Date'?: string
}

export interface ProcessedSample {
  sampleId: string
  assay: string
}

export interface AssayMapping {
  assayName: string
  testNamePatterns: string[]
}

export const ASSAY_MAPPINGS: AssayMapping[] = [
  {
    assayName: 'SLM',
    testNamePatterns: [
      'Sal-PCR GeneUp-125g',
      'Sal-PCR GeneUp-325g',
      'Sal-PCR GeneUp-375g',
      'Sal-PCR GeneUp-FP'
    ]
  },
  {
    assayName: 'ECO',
    testNamePatterns: [
      'EC0157-PCR GeneUP-25g',
      'EC0157-PCR GeneUP-325g',
      'EC0157-PCR GeneUP-375g',
    ]
  },
  {
    assayName: 'EH1',
    testNamePatterns: [
      'EHEC(STEC)-GeneUP-125g',
      'EHEC(STEC)-GeneUP-25g',
      'EHEC(STEC)-GeneUP-375g',
    ]
  },
  {
    assayName: 'LIS',
    testNamePatterns: [
      'LIS-PCR GeneUp-125g',
      'LIS-PCR GeneUp-FP',
    ]
  },
  {
    assayName: 'LMO',
    testNamePatterns: [
      'LM-PCR GeneUp-125g',
      'LM-PCR GeneUp-FP'
    ]
  }
]

export const extractAssayFromTestName = (testName: string): string | null => {
  const normalizedTestName = testName.toLowerCase().replace(/\s+/g, ' ').trim()

  for (const mapping of ASSAY_MAPPINGS) {
    for (const pattern of mapping.testNamePatterns) {
      const normalizedPattern = pattern.toLowerCase().replace(/\s+/g, ' ').trim()

      if (normalizedTestName.includes(normalizedPattern)) {
        return mapping.assayName
      }
    }
  }
  return null
}

export const processGeneupExcelFile = async (file: File): Promise<Record<string, ProcessedSample[]>> => {
  const jsonData = await readExcelFile(file) as GeneupExcelRow[]
  const groupedByAssay: Record<string, ProcessedSample[]> = {}

  jsonData.forEach((row) => {
    const sampleNum = row['Sample Num']
    const testName = row['Test Name']

    if (sampleNum && testName) {
      const assayName = extractAssayFromTestName(testName)

      if (assayName) {
        if (!groupedByAssay[assayName]) {
          groupedByAssay[assayName] = []
        }

        groupedByAssay[assayName].push({
          sampleId: sampleNum,
          assay: assayName
        })
      }
    }
  })

  return groupedByAssay
}

export const generateCSV = (samples: ProcessedSample[]): string => {
  const headers = ['Sample Id', 'Assay', 'Matrix', 'Customer', 'ProductionLotNumber', 'Notes']
  const rows = samples.map(sample => [
    sample.sampleId,
    sample.assay,
    '', '', '', ''
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\r\n')
}

export const downloadCSV = (assay: string, samples: ProcessedSample[]) => {
  const csv = generateCSV(samples)
  const utf8BOM = '\ufeff'
  const blob = new Blob([utf8BOM, csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${assay.replace(/\s+/g, '_')}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
