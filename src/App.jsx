import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import TestingDashboard from './pages/TestingDashboard' 

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="testing" element={<TestingDashboard />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App