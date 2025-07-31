import { useCallback } from 'react'

interface FileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  multiple?: boolean
  accept?: string
  title: string
  description?: string
}

function FileUpload({ files, onFilesChange, multiple = false, accept = ".xlsx,.xls", title, description }: FileUploadProps) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    )
    
    if (multiple) {
      onFilesChange([...files, ...droppedFiles])
    } else {
      onFilesChange(droppedFiles.slice(0, 1))
    }
  }, [files, onFilesChange, multiple])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (multiple) {
      onFilesChange([...files, ...selectedFiles])
    } else {
      onFilesChange(selectedFiles.slice(0, 1))
    }
  }

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-12 mb-8 bg-white hover:border-blue-400 hover:bg-blue-50 transition-colors duration-300"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <p className="text-gray-600 mb-2">{title}</p>
      {description && <p className="text-gray-500 mb-4">{description}</p>}
      <p className="text-gray-500 mb-4">or</p>
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        className="block mx-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        onChange={handleFileSelect}
      />
    </div>
  )
}

export default FileUpload