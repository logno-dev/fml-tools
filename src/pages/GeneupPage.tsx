import { useState, useCallback } from 'react'
import FileUpload from '../components/FileUpload'
import FileList from '../components/FileList'
import { processGeneupExcelFile, downloadCSV, ProcessedSample } from '../utils/geneupUtils'

function GeneupPage() {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [processedData, setProcessedData] = useState<Record<string, ProcessedSample[]>>({})

  const processFiles = useCallback(async () => {
    setProcessing(true)
    const allProcessedData: Record<string, ProcessedSample[]> = {}

    for (const file of files) {
      const fileData = await processGeneupExcelFile(file)

      Object.entries(fileData).forEach(([assay, samples]) => {
        if (!allProcessedData[assay]) {
          allProcessedData[assay] = []
        }
        allProcessedData[assay].push(...samples)
      })
    }

    setProcessedData(allProcessedData)
    setProcessing(false)
  }, [files])

  const downloadAllCSVs = () => {
    Object.entries(processedData).forEach(([assay, samples]) => {
      downloadCSV(assay, samples)
    })
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">GeneUP CSV Generator</h1>

        <FileUpload
          files={files}
          onFilesChange={setFiles}
          multiple={true}
          title="Drag and drop Excel files here"
        />

        <FileList
          files={files}
          onClear={() => setFiles([])}
          onProcess={processFiles}
          processing={processing}
          multiple={true}
        />

        {Object.keys(processedData).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Processed Data:</h3>
            <div className="space-y-4 mb-6">
              {Object.entries(processedData).map(([assay, samples]) => (
                <div key={assay} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-700 mb-3">
                    {assay} ({samples.length} samples)
                  </h4>
                  <button
                    onClick={() => downloadCSV(assay, samples)}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Download {assay} CSV
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={downloadAllCSVs}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Download All CSVs
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default GeneupPage