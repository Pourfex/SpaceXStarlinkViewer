import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import './StarlinkDetail.css'

function StarlinkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [starlink, setStarlink] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get the page number from navigation state
  const previousPage = location.state?.page || 1

  useEffect(() => {
    fetchStarlinkDetail()
  }, [id])

  const fetchStarlinkDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.spacexdata.com/v4/starlink/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch Starlink details')
      }
      const data = await response.json()
      setStarlink(data)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleBackClick = () => {
    navigate(`/?page=${previousPage}`)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  if (loading) {
    return <div className="loading">Loading Starlink details...</div>
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">Error: {error}</div>
        <button onClick={handleBackClick} className="back-btn">
          ← Back to List
        </button>
      </div>
    )
  }

  if (!starlink) {
    return <div className="error">Starlink not found</div>
  }

  const spaceTrack = starlink.spaceTrack || {}

  return (
    <div className="starlink-detail-container">
      <button onClick={handleBackClick} className="back-btn">
        ← Back to List (Page {previousPage})
      </button>

      <div className="detail-header">
        <div>
          <h1>{spaceTrack.OBJECT_NAME || 'Unknown Satellite'}</h1>
          <p className="object-id">Object ID: {spaceTrack.OBJECT_ID || 'N/A'}</p>
        </div>
        <span className={`status-badge-large ${spaceTrack.DECAYED ? 'decayed' : 'active'}`}>
          {spaceTrack.DECAYED ? '💀 Decayed' : '✓ Active'}
        </span>
      </div>

      <div className="detail-grid">
        {/* General Information */}
        <div className="detail-section">
          <h2>General Information</h2>
          <div className="detail-content">
            <div className="detail-row">
              <span className="detail-label">NORAD Catalog ID:</span>
              <span className="detail-value">{spaceTrack.NORAD_CAT_ID || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Version:</span>
              <span className="detail-value">{starlink.version || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Launch ID:</span>
              <span className="detail-value">{starlink.launch || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Country:</span>
              <span className="detail-value">{spaceTrack.COUNTRY_CODE || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Object Type:</span>
              <span className="detail-value">{spaceTrack.OBJECT_TYPE || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">RCS Size:</span>
              <span className="detail-value">{spaceTrack.RCS_SIZE || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Launch & Decay Information */}
        <div className="detail-section">
          <h2>Launch & Status</h2>
          <div className="detail-content">
            <div className="detail-row">
              <span className="detail-label">Launch Date:</span>
              <span className="detail-value">{formatDate(spaceTrack.LAUNCH_DATE)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Launch Site:</span>
              <span className="detail-value">{spaceTrack.SITE || 'N/A'}</span>
            </div>
            {spaceTrack.DECAY_DATE && (
              <div className="detail-row">
                <span className="detail-label">Decay Date:</span>
                <span className="detail-value highlight-red">
                  {formatDate(spaceTrack.DECAY_DATE)}
                </span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Decayed:</span>
              <span className={`detail-value ${spaceTrack.DECAYED ? 'highlight-red' : 'highlight-green'}`}>
                {spaceTrack.DECAYED ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Current Position */}
        <div className="detail-section">
          <h2>Current Position</h2>
          <div className="detail-content">
            <div className="detail-row">
              <span className="detail-label">Height:</span>
              <span className="detail-value">
                {starlink.height_km ? `${starlink.height_km.toFixed(2)} km` : 'N/A'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Latitude:</span>
              <span className="detail-value">
                {starlink.latitude ? `${starlink.latitude.toFixed(4)}°` : 'N/A'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Longitude:</span>
              <span className="detail-value">
                {starlink.longitude ? `${starlink.longitude.toFixed(4)}°` : 'N/A'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Velocity:</span>
              <span className="detail-value">
                {starlink.velocity_kms ? `${starlink.velocity_kms.toFixed(2)} km/s` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Orbital Elements */}
        <div className="detail-section">
          <h2>Orbital Elements</h2>
          <div className="detail-content">
            <div className="detail-row">
              <span className="detail-label">Epoch:</span>
              <span className="detail-value">{formatDate(spaceTrack.EPOCH)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Mean Motion:</span>
              <span className="detail-value">
                {spaceTrack.MEAN_MOTION ? `${spaceTrack.MEAN_MOTION.toFixed(8)} rev/day` : 'N/A'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Eccentricity:</span>
              <span className="detail-value">
                {spaceTrack.ECCENTRICITY ? spaceTrack.ECCENTRICITY.toFixed(7) : 'N/A'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Inclination:</span>
              <span className="detail-value">
                {spaceTrack.INCLINATION ? `${spaceTrack.INCLINATION.toFixed(4)}°` : 'N/A'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Semimajor Axis:</span>
              <span className="detail-value">
                {spaceTrack.SEMIMAJOR_AXIS ? `${spaceTrack.SEMIMAJOR_AXIS.toFixed(3)} km` : 'N/A'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Period:</span>
              <span className="detail-value">
                {spaceTrack.PERIOD ? `${spaceTrack.PERIOD.toFixed(3)} min` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Orbit Characteristics */}
        <div className="detail-section">
          <h2>Orbit Characteristics</h2>
          <div className="detail-content">
            <div className="detail-row">
              <span className="detail-label">Apoapsis:</span>
              <span className="detail-value">
                {spaceTrack.APOAPSIS ? `${spaceTrack.APOAPSIS.toFixed(3)} km` : 'N/A'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Periapsis:</span>
              <span className="detail-value">
                {spaceTrack.PERIAPSIS ? `${spaceTrack.PERIAPSIS.toFixed(3)} km` : 'N/A'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">RA of Asc Node:</span>
              <span className="detail-value">
                {spaceTrack.RA_OF_ASC_NODE ? `${spaceTrack.RA_OF_ASC_NODE.toFixed(4)}°` : 'N/A'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Arg of Pericenter:</span>
              <span className="detail-value">
                {spaceTrack.ARG_OF_PERICENTER ? `${spaceTrack.ARG_OF_PERICENTER.toFixed(4)}°` : 'N/A'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Mean Anomaly:</span>
              <span className="detail-value">
                {spaceTrack.MEAN_ANOMALY ? `${spaceTrack.MEAN_ANOMALY.toFixed(4)}°` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* TLE Data */}
        <div className="detail-section full-width">
          <h2>Two-Line Element (TLE) Set</h2>
          <div className="detail-content">
            <div className="tle-container">
              <code className="tle-line">{spaceTrack.TLE_LINE0 || 'N/A'}</code>
              <code className="tle-line">{spaceTrack.TLE_LINE1 || 'N/A'}</code>
              <code className="tle-line">{spaceTrack.TLE_LINE2 || 'N/A'}</code>
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleBackClick} className="back-btn bottom-back">
        ← Back to List (Page {previousPage})
      </button>
    </div>
  )
}

export default StarlinkDetail

