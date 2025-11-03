import React, { useEffect, useRef } from 'react'

function VelocityHistogram({ data }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && data) {
      // Pass data to the web component
      ref.current.data = JSON.stringify(data)
    }
  }, [data])

  return <velocity-histogram ref={ref}></velocity-histogram>
}

export default VelocityHistogram
