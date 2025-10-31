import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import StarlinkList from './components/StarlinkList'
import StarlinkDetail from './components/StarlinkDetail'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="header-content">
            <h1>🚀 SpaceX Starlink Tracker</h1>
            <p>Explore the Starlink satellite constellation</p>
          </div>
        </header>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<StarlinkList />} />
            <Route path="/starlink/:id" element={<StarlinkDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

