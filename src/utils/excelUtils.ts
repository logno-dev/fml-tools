import * as XLSX from 'xlsx'

export interface ExcelRow {
  [key: string]: string | number | boolean | null | undefined
}

export const readExcelFile = (file: File): Promise<ExcelRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

export const readExcelFileAsArray = (file: File): Promise<(string | number)[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const arrayData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        // Preserve numbers for dates, convert others to strings
        const mixedData: (string | number)[][] = arrayData.map(row => 
          row.map(cell => {
            if (cell === null || cell === undefined) return '';
            if (typeof cell === 'number') return cell;
            return String(cell);
          })
        )
        resolve(mixedData)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}