import { readExcelFileAsArray } from './excelUtils'

export interface ProcessedData {
  sequenceNumber: number
  columnB: string
  columnC: string
}

const specialRunPattern = /SpecialRun/i

export const processQcExcelFile = async (file: File): Promise<ProcessedData[]> => {
  const jsonData = await readExcelFileAsArray(file)
  const processedRows: ProcessedData[] = []
  
  jsonData.forEach((row, index) => {
    if (index === 0) return
    
    const columnB = row[1] ? String(row[1]).trim() : ''
    const columnC = row[2] ? String(row[2]).trim() : ''
    
    if (columnB || columnC) {
      processedRows.push({
        sequenceNumber: 0, // Will be assigned after sorting
        columnB,
        columnC
      })
    }
  })

  // Prioritize SpecialRun rows, then sort by column C and column B as before.
  processedRows.sort((a, b) => {
    const aIsSpecialRun = specialRunPattern.test(`${a.columnB} ${a.columnC}`)
    const bIsSpecialRun = specialRunPattern.test(`${b.columnB} ${b.columnC}`)
    if (aIsSpecialRun !== bIsSpecialRun) {
      return aIsSpecialRun ? -1 : 1
    }

    const columnCCompare = a.columnC.localeCompare(b.columnC)
    if (columnCCompare !== 0) {
      return columnCCompare
    }
    return a.columnB.localeCompare(b.columnB)
  })

  // Assign sequence numbers after sorting
  processedRows.forEach((row, index) => {
    row.sequenceNumber = index + 1
  })

  return processedRows
}

export const chunkData = (data: ProcessedData[], chunkSize: number): ProcessedData[][] => {
  const chunks = []
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize))
  }
  return chunks
}
