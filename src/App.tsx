import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import GeneupPage from './pages/GeneupPage'
import QcPage from './pages/QcPage'
import SilikerPage from './pages/SilikerPage'
import WaterPotabilityPage from './pages/WaterPotabilityPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/geneup" element={<GeneupPage />} />
          <Route path="/qc" element={<QcPage />} />
          <Route path="/siliker" element={<SilikerPage />} />
          <Route path="/water-potability" element={<WaterPotabilityPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
