import { Link, useLocation } from 'react-router-dom'

function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-white shadow-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                FML Tools
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/geneup"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/geneup')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                GeneUP CSV Generator
              </Link>
              <Link
                to="/qc"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/qc')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                QC Print Generator
              </Link>
              <Link
                to="/siliker"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/siliker')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Siliker Formatter
              </Link>
              <Link
                to="/water-potability"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/water-potability')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Water Potability
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
