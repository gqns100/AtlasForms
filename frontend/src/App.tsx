import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Dashboard } from './components/Dashboard'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto py-4">
            <h1 className="text-2xl font-bold">Personal Finance Manager</h1>
          </div>
        </header>
        <main className="container mx-auto py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
