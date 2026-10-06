import * as XLSX from 'xlsx'
import ExcelJS from 'exceljs'

export type WaterPotabilityFieldType = 'text' | 'time'

export interface WaterPotabilityField {
  id: string
  label: string
  type: WaterPotabilityFieldType
}

export interface WaterPotabilityTest {
  id: string
  name: string
  fields: WaterPotabilityField[]
}

export interface WaterPotabilityFormVersion {
  id: string
  name: string
  worksheetTitle: string
  outputFilename: string
  tests: WaterPotabilityTest[]
}

export interface WaterPotabilitySample {
  id: string
  testId: string
  testName: string
  sampleNum: string
  values: Record<string, string>
}

export const WATER_POTABILITY_FORM_136_V100526: WaterPotabilityFormVersion = {
  id: 'form-136-v100526',
  name: 'Water Potability Tracer Log Form 136 v.100526',
  worksheetTitle: 'Water Potability Tracer Log Form 136 v.100526',
  outputFilename: 'Water Potability Tracer Log Form 136 v.100526.xlsx',
  tests: [
    {
      id: 'colitag-v8',
      name: 'Coliforms & E. coli - Colitag v.8',
      fields: [
        { id: 'chlorineCheckTime', label: 'Time of Chlorine Check', type: 'time' },
        { id: 'chlorineCheckPpm', label: 'Chlorine  Check (ppm)', type: 'text' },
        { id: 'incubationTime', label: 'Time of Incubation', type: 'time' },
      ],
    },
    {
      id: 'hpc-v3',
      name: 'HPC-0,1 v.3',
      fields: [
        { id: 'smaTemperStartTime', label: 'SMA Temper Start Time', type: 'time' },
        { id: 'smaTemperExpirationTime', label: 'SMA Temper Exp Time', type: 'time' },
        { id: 'platingStartTime', label: 'Plating Start Time', type: 'time' },
        { id: 'platingEndTime', label: 'Plating End Time', type: 'time' },
        { id: 'mediaPouredTime', label: 'Media Poured Time', type: 'time' },
        { id: 'incubationTime', label: 'Time of Incubation', type: 'time' },
      ],
    },
  ],
}

export const ACTIVE_WATER_POTABILITY_FORM = WATER_POTABILITY_FORM_136_V100526

const normalizeHeader = (value: unknown) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')

const displayCell = (value: unknown) => {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

export const parseWaterPotabilityRows = (
  rows: unknown[][],
  form = ACTIVE_WATER_POTABILITY_FORM,
): WaterPotabilitySample[] => {
  const headerIndex = rows.findIndex((row) => row.some((cell) => displayCell(cell) !== ''))
  if (headerIndex === -1) throw new Error('The input file is empty.')

  const headers = rows[headerIndex].map(normalizeHeader)
  const testNameIndex = headers.indexOf('test name')
  const sampleNumIndex = headers.indexOf('sample num')
  if (testNameIndex === -1 || sampleNumIndex === -1) {
    throw new Error('The input file must contain Test Name and Sample Num columns.')
  }

  const testsByName = new Map(form.tests.map((test) => [test.name.toLowerCase(), test]))
  const samples: WaterPotabilitySample[] = []
  const errors: string[] = []

  rows.slice(headerIndex + 1).forEach((row, index) => {
    const sourceRow = headerIndex + index + 2
    const testName = displayCell(row[testNameIndex])
    const sampleNum = displayCell(row[sampleNumIndex])
    if (!testName && !sampleNum) return
    if (!testName || !sampleNum) {
      errors.push(`Row ${sourceRow}: Test Name and Sample Num are both required.`)
      return
    }

    const test = testsByName.get(testName.toLowerCase())
    if (!test) {
      errors.push(`Row ${sourceRow}: unsupported Test Name "${testName}".`)
      return
    }

    samples.push({
      id: `${sourceRow}-${test.id}-${sampleNum}`,
      testId: test.id,
      testName: test.name,
      sampleNum,
      values: Object.fromEntries(test.fields.map((field) => [field.id, ''])),
    })
  })

  if (errors.length > 0) throw new Error(errors.join('\n'))
  if (samples.length === 0) throw new Error('No sample rows were found in the input file.')
  return samples
}

export const readWaterPotabilityFile = async (file: File) => {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data, { type: 'array' })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!worksheet) throw new Error('The input file does not contain a worksheet.')
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: '',
    raw: false,
  })
  return parseWaterPotabilityRows(rows)
}

const excelTime = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number)
  return (hours * 60 + minutes) / (24 * 60)
}

const excelValue = (field: WaterPotabilityField, value: string): string | number => {
  if (field.type === 'time') return excelTime(value)
  const numericValue = Number(value)
  return value.trim() !== '' && Number.isFinite(numericValue) ? numericValue : value
}

const formatDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number)
  return `${month}/${day}/${String(year).slice(-2)}`
}

export const createWaterPotabilityWorkbook = (
  samples: WaterPotabilitySample[],
  date: string,
  analyst: string,
  form = ACTIVE_WATER_POTABILITY_FORM,
) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Water Potability')
  worksheet.columns = [
    { width: 36 },
    { width: 18 },
    { width: 24 },
    { width: 25 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
  ]
  worksheet.addRow([form.worksheetTitle]).font = { bold: true, size: 14 }
  worksheet.addRow([])

  const border: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
  }

  form.tests.forEach((test, testIndex) => {
    if (testIndex > 0) worksheet.addRow([])
    worksheet.addRow([`Date: ${formatDate(date)}`, `Analyst: ${analyst.trim()}`])
    const headerRow = worksheet.addRow(['Test Name', 'Sample Num', ...test.fields.map((field) => field.label)])
    headerRow.height = 30
    headerRow.eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAF7' } }
      cell.border = border
      cell.alignment = { wrapText: true, vertical: 'middle' }
    })

    const testSamples = samples.filter((sample) => sample.testId === test.id)
    testSamples.forEach((sample) => {
      const sampleRow = worksheet.addRow([
        test.name,
        sample.sampleNum,
        ...test.fields.map((field) => excelValue(field, sample.values[field.id])),
      ])
      sampleRow.eachCell((cell, column) => {
        cell.border = border
        cell.alignment = { vertical: 'middle' }
        if (column <= 2) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
        }
        if (test.fields[column - 3]?.type === 'time') cell.numFmt = 'h:mm AM/PM'
      })
    })
  })

  return workbook
}

export const downloadWaterPotabilityWorkbook = async (
  samples: WaterPotabilitySample[],
  date: string,
  analyst: string,
) => {
  const workbook = createWaterPotabilityWorkbook(samples, date, analyst)
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = ACTIVE_WATER_POTABILITY_FORM.outputFilename
  link.click()
  URL.revokeObjectURL(url)
}
