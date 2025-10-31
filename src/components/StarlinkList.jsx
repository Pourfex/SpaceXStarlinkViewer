import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BeeswarmChart from './BeeswarmChart'
import LaunchesAreaChart from './LaunchesAreaChart'
import VelocityHistogram from './VelocityHistogram'
import './StarlinkList.css'

const ITEMS_PER_PAGE = 10

function StarlinkList() {
  const [starlinks, setStarlinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get page from URL or default to 1
  const queryParams = new URLSearchParams(location.search)
  const initialPage = parseInt(queryParams.get('page')) || 1
  const [currentPage, setCurrentPage] = useState(initialPage)

  useEffect(() => {
    fetchStarlinks()
  }, [])

  useEffect(() => {
    // Update URL when page changes
    navigate(`?page=${currentPage}`, { replace: true })
  }, [currentPage, navigate])

  const fetchStarlinks = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://api.spacexdata.com/v4/starlink')
      if (!response.ok) {
        throw new Error('Failed to fetch Starlink data')
      }
      const data = await response.json()
      setStarlinks(data)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(starlinks.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentStarlinks = starlinks.slice(startIndex, endIndex)

  const handleStarlinkClick = (starlink) => {
    navigate(`/starlink/${starlink.id}`, { state: { page: currentPage } })
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="loading">Loading Starlink data...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  return (
    <div className="starlink-list-container">
      <div className="tabs">
        <button className="tab active">Starlink Satellites</button>
      </div>

      <div className="list-info">
        <h2>Starlink Satellites</h2>
        <p>Total: {starlinks.length} satellites | Page {currentPage} of {totalPages}</p>
      </div>

      <div className="starlink-grid">
        {currentStarlinks.map((starlink) => (
          <div
            key={starlink.id}
            className="starlink-card"
            onClick={() => handleStarlinkClick(starlink)}
          >
            <div className="card-header">
              <h3>{starlink.spaceTrack?.OBJECT_NAME || 'Unknown'}</h3>
              <span className={`status-badge ${starlink.spaceTrack?.DECAYED ? 'decayed' : 'active'}`}>
                {starlink.spaceTrack?.DECAYED ? '💀 Decayed' : '✓ Active'}
              </span>
            </div>
            
            <div className="card-content">
              <div className="info-row">
                <span className="label">Launch Date:</span>
                <span className="value">{formatDate(starlink.spaceTrack?.LAUNCH_DATE)}</span>
              </div>
              
              {starlink.spaceTrack?.DECAY_DATE && (
                <div className="info-row">
                  <span className="label">Decay Date:</span>
                  <span className="value">{formatDate(starlink.spaceTrack?.DECAY_DATE)}</span>
                </div>
              )}
              
              <div className="info-row">
                <span className="label">Height:</span>
                <span className="value">
                  {starlink.height_km ? `${starlink.height_km.toFixed(2)} km` : 'N/A'}
                </span>
              </div>
              
              <div className="info-row">
                <span className="label">Version:</span>
                <span className="value">{starlink.version || 'N/A'}</span>
              </div>
            </div>
            
            <div className="card-footer">
              <span>Click for details →</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          « First
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          ‹ Prev
        </button>
        
        <div className="page-numbers">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Next ›
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Last »
        </button>
      </div>

      <div className="visualizations-container">
        <h2 className="visualizations-title">📊 Data Visualizations</h2>
        
        <div className="visualization-section">
          <h3>Launches Through the Years</h3>
          <p>Area chart showing the number of Starlink launches per year</p>
          <LaunchesAreaChart data={starlinks} />
        </div>

        <div className="visualization-section">
          <h3>Velocity Distribution</h3>
          <p>Histogram showing the distribution of satellite velocities</p>
          <VelocityHistogram data={starlinks} />
        </div>

        <div className="visualization-section">
          <h3>Altitude Distribution</h3>
          <p>Beeswarm visualization of all Starlink satellite altitudes</p>
          <BeeswarmChart data={starlinks} />
        </div>
      </div>
    </div>
  )
}

export default StarlinkList

