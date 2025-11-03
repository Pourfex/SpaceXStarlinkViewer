import React, { useEffect, useRef } from 'react'

function LaunchesAreaChart({ data }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && data) {
      // Pass data to the web component
      ref.current.data = JSON.stringify(data)
    }
  }, [data])

  return <launches-area-chart ref={ref}></launches-area-chart>
}

export default LaunchesAreaChart
