import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">FML Tools</h1>
        <p className="text-xl text-gray-600 mb-12">
          A collection of laboratory tools for file processing and data management
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Link
            to="/geneup"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300 block"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              GeneUP CSV Generator
            </h2>
            <p className="text-gray-600 mb-4">
              Process Excel files and generate CSV files organized by assay type for GeneUP testing.
            </p>
            <div className="text-blue-600 font-medium">
              Go to GeneUP Tool →
            </div>
          </Link>
          
          <Link
            to="/qc"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300 block"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              QC Print Generator
            </h2>
            <p className="text-gray-600 mb-4">
              Process Excel files and generate print-ready QC reports with organized data tables.
            </p>
            <div className="text-blue-600 font-medium">
              Go to QC Tool →
            </div>
          </Link>
          
          <Link
            to="/siliker"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300 block"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Siliker Formatter
            </h2>
            <p className="text-gray-600 mb-4">
              Format Excel files for Siliker by extracting specific columns and sorting data by date and description.
            </p>
            <div className="text-blue-600 font-medium">
              Go to Siliker Tool →
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home