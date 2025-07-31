interface FileListProps {
  files: File[]
  onClear: () => void
  onProcess: () => void
  processing: boolean
  multiple?: boolean
}

function FileList({ files, onClear, onProcess, processing, multiple = false }: FileListProps) {
  if (files.length === 0) return null

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {multiple ? 'Selected Files:' : 'Selected File:'}
      </h3>
      
      {multiple ? (
        <ul className="space-y-2 mb-6">
          {files.map((file, index) => (
            <li key={index} className="text-gray-700 py-2 px-4 bg-gray-50 rounded border-b border-gray-200 last:border-b-0">
              {file.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700 py-2 px-4 bg-gray-50 rounded border mb-6">
          {files[0]?.name}
        </p>
      )}
      
      <div className="space-x-4">
        <button
          onClick={onProcess}
          disabled={processing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {processing ? 'Processing...' : multiple ? 'Process Files' : 'Process & Preview'}
        </button>
        <button
          onClick={onClear}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {multiple ? 'Clear Files' : 'Clear File'}
        </button>
      </div>
    </div>
  )
}

export default FileList