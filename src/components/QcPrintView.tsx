import { ProcessedData, chunkData } from '../utils/qcUtils'

interface QcPrintViewProps {
  data: ProcessedData[]
  onPrint: () => void
  onBack: () => void
}

function QcPrintView({ data, onPrint, onBack }: QcPrintViewProps) {
  const renderPrintView = () => {
    const pages = chunkData(data, 100)
    
    return (
      <div className="print-view">
        {pages.map((pageData, pageIndex) => {
          const leftColumn = pageData.slice(0, 50)
          const rightColumn = pageData.slice(50, 100)
          
          return (
            <div key={pageIndex} className={`page ${pageIndex > 0 ? 'page-break' : ''}`}>
              <div className="page-content">
                <div className="table-container">
                  <table className="print-table">
                    <thead>
                      <tr>
                        <th className="col-number">#</th>
                        <th className="col-data">Column B</th>
                        <th className="col-data">Column C</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leftColumn.map((row) => (
                        <tr key={row.sequenceNumber}>
                          <td className="col-number">{row.sequenceNumber}</td>
                          <td className="col-data" title={row.columnB}>{row.columnB}</td>
                          <td className="col-data" title={row.columnC}>{row.columnC}</td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 50 - leftColumn.length) }).map((_, index) => (
                        <tr key={`empty-left-${index}`}>
                          <td className="col-number">&nbsp;</td>
                          <td className="col-data">&nbsp;</td>
                          <td className="col-data">&nbsp;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="table-container">
                  <table className="print-table">
                    <thead>
                      <tr>
                        <th className="col-number">#</th>
                        <th className="col-data">Column B</th>
                        <th className="col-data">Column C</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rightColumn.map((row) => (
                        <tr key={row.sequenceNumber}>
                          <td className="col-number">{row.sequenceNumber}</td>
                          <td className="col-data" title={row.columnB}>{row.columnB}</td>
                          <td className="col-data" title={row.columnC}>{row.columnC}</td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 50 - rightColumn.length) }).map((_, index) => (
                        <tr key={`empty-right-${index}`}>
                          <td className="col-number">&nbsp;</td>
                          <td className="col-data">&nbsp;</td>
                          <td className="col-data">&nbsp;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <div className="no-print bg-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">QC Print Preview</h1>
          <div className="space-x-4">
            <button
              onClick={onPrint}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Print
            </button>
            <button
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Back to Upload
            </button>
          </div>
        </div>
      </div>
      {renderPrintView()}
    </div>
  )
}

export default QcPrintView