import React, { useEffect, useRef } from 'react'

function BeeswarmChart({ data }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && data) {
      // Pass data to the web component
      ref.current.data = JSON.stringify(data)
    }
  }, [data])

  return <beeswarm-chart ref={ref}></beeswarm-chart>
}

export default BeeswarmChart
