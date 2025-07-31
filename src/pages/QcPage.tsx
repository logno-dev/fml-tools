import { useState, useCallback } from 'react'
import FileUpload from '../components/FileUpload'
import FileList from '../components/FileList'
import QcPrintView from '../components/QcPrintView'
import { processQcExcelFile, ProcessedData } from '../utils/qcUtils'

function QcPage() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [processedData, setProcessedData] = useState<ProcessedData[]>([])
  const [showPrintView, setShowPrintView] = useState(false)

  const processFile = useCallback(async () => {
    if (!file) return
    
    setProcessing(true)
    try {
      const data = await processQcExcelFile(file)
      setProcessedData(data)
      setShowPrintView(true)
    } catch (error) {
      console.error('Error processing file:', error)
    }
    setProcessing(false)
  }, [file])

  const handlePrint = () => {
    window.print()
  }

  const handleFilesChange = (files: File[]) => {
    setFile(files[0] || null)
  }

  const handleClear = () => {
    setFile(null)
  }

  if (showPrintView) {
    return (
      <QcPrintView
        data={processedData}
        onPrint={handlePrint}
        onBack={() => setShowPrintView(false)}
      />
    )
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">QC Print Generator</h1>

        <FileUpload
          files={file ? [file] : []}
          onFilesChange={handleFilesChange}
          multiple={false}
          title="Drag and drop Excel file here"
        />

        <FileList
          files={file ? [file] : []}
          onClear={handleClear}
          onProcess={processFile}
          processing={processing}
          multiple={false}
        />
      </div>
    </div>
  )
}

export default QcPage