import { useState } from 'react'
import FileUpload from '../components/FileUpload'
import {
  ACTIVE_WATER_POTABILITY_FORM,
  downloadWaterPotabilityWorkbook,
  readWaterPotabilityFile,
  type WaterPotabilitySample,
} from '../utils/waterPotabilityUtils'

const today = () => {
  const date = new Date()
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return offsetDate.toISOString().slice(0, 10)
}

function WaterPotabilityPage() {
  const [files, setFiles] = useState<File[]>([])
  const [samples, setSamples] = useState<WaterPotabilitySample[]>([])
  const [date, setDate] = useState(today)
  const [analyst, setAnalyst] = useState('')
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFilesChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
    setSamples([])
    setError('')
  }

  const loadSamples = async () => {
    if (!files[0]) return
    setIsProcessing(true)
    setError('')
    try {
      setSamples(await readWaterPotabilityFile(files[0]))
    } catch (loadError) {
      setSamples([])
      setError(loadError instanceof Error ? loadError.message : 'Unable to read the input file.')
    } finally {
      setIsProcessing(false)
    }
  }

  const updateValue = (sampleId: string, fieldId: string, value: string) => {
    setSamples((currentSamples) => currentSamples.map((sample) => (
      sample.id === sampleId
        ? { ...sample, values: { ...sample.values, [fieldId]: value } }
        : sample
    )))
  }

  const missingValues = samples.some((sample) => {
    const test = ACTIVE_WATER_POTABILITY_FORM.tests.find((candidate) => candidate.id === sample.testId)
    return test?.fields.some((field) => !field.derivedFrom && !sample.values[field.id]?.trim()) ?? true
  })
  const canDownload = samples.length > 0 && Boolean(date) && Boolean(analyst.trim()) && !missingValues

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-700 mb-2">Form 136 v.100526</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Water Potability Tracer Log</h1>
          <p className="text-lg text-gray-600">
            Upload a CSV or Excel file containing Test Name and Sample Num columns, then complete the tracer fields for each sample.
          </p>
        </div>

        <FileUpload
          files={files}
          onFilesChange={handleFilesChange}
          accept=".xlsx,.xls,.csv"
          title="Drag and drop a CSV or Excel file here"
          description="Supports Test Names containing Colitag or HPC"
        />

        {files[0] && samples.length === 0 && (
          <section className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
            <p className="text-gray-700 mb-4">Selected file: <span className="font-medium">{files[0].name}</span></p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={loadSamples}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isProcessing ? 'Loading...' : 'Load Samples'}
              </button>
              <button
                type="button"
                onClick={() => handleFilesChange([])}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Clear File
              </button>
            </div>
          </section>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-8 whitespace-pre-line" role="alert">
            {error}
          </div>
        )}

        {samples.length > 0 && (
          <div className="space-y-8">
            <section className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row gap-5">
                <label className="flex-1 text-sm font-medium text-gray-700">
                  Date
                  <input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </label>
                <label className="flex-1 text-sm font-medium text-gray-700">
                  Analyst
                  <input
                    type="text"
                    value={analyst}
                    onChange={(event) => setAnalyst(event.target.value)}
                    className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                    placeholder="Analyst name or initials"
                  />
                </label>
              </div>
            </section>

            {ACTIVE_WATER_POTABILITY_FORM.tests.map((test) => {
              const testSamples = samples.filter((sample) => sample.testId === test.id)
              const inputFields = test.fields.filter((field) => !field.derivedFrom)
              return (
                <section key={test.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-slate-800 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold">{test.name}</h2>
                    <span className="text-sm text-slate-300">{testSamples.length} sample{testSamples.length === 1 ? '' : 's'}</span>
                  </div>
                  {test.fields.some((field) => field.derivedFrom) && (
                    <p className="bg-cyan-50 border-b border-cyan-100 px-6 py-3 text-sm text-cyan-900">
                      SMA Temper Exp Time is calculated automatically as three hours after SMA Temper Start Time.
                    </p>
                  )}
                  {testSamples.length === 0 ? (
                    <p className="p-6 text-gray-500">No samples for this test were found in the input file.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Sample Num</th>
                            {inputFields.map((field) => (
                              <th key={field.id} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                {field.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {testSamples.map((sample) => (
                            <tr key={sample.id}>
                              <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{sample.sampleNum}</td>
                              {inputFields.map((field) => (
                                <td key={field.id} className="px-4 py-3 min-w-48">
                                  <input
                                    type={field.type}
                                    inputMode={field.type === 'text' ? 'decimal' : undefined}
                                    value={sample.values[field.id]}
                                    onChange={(event) => updateValue(sample.id, field.id, event.target.value)}
                                    aria-label={`${sample.sampleNum} ${field.label}`}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )
            })}

            <section className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">Output</p>
                <p className="text-sm text-gray-600">{ACTIVE_WATER_POTABILITY_FORM.outputFilename}</p>
                {!canDownload && <p className="text-sm text-amber-700 mt-1">Complete the date, analyst, and all sample fields to download.</p>}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleFilesChange([])}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-5 rounded-lg transition-colors"
                >
                  Start Over
                </button>
                <button
                  type="button"
                  onClick={() => downloadWaterPotabilityWorkbook(samples, date, analyst)}
                  disabled={!canDownload}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-3 px-5 rounded-lg transition-colors"
                >
                  Download Workbook
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}

export default WaterPotabilityPage
