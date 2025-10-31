import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import './BeeswarmChart.css'

function BeeswarmChart({ data }) {
  const svgRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useRef(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setDimensions({
          width: width,
          height: 300
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (!data || data.length === 0 || dimensions.width === 0) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    // Filter data to only include satellites with valid height_km
    const validData = data.filter(d => d.height_km !== null && !isNaN(d.height_km))
    
    if (validData.length === 0) return

    // Set up dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 60 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(validData, d => d.height_km)])
      .range([0, width])
      .nice()

    // Create simulation for beeswarm
    const radius = 4
    const simulation = d3.forceSimulation(validData)
      .force('x', d3.forceX(d => xScale(d.height_km)).strength(1))
      .force('y', d3.forceY(height / 2).strength(0.1))
      .force('collide', d3.forceCollide(radius + 0.5))
      .stop()

    // Run simulation
    for (let i = 0; i < 120; i++) simulation.tick()

    // Add gradient definition
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'circle-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#667eea')
      .attr('stop-opacity', 0.8)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#764ba2')
      .attr('stop-opacity', 0.8)

    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'beeswarm-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none')

    // Add circles
    g.selectAll('circle')
      .data(validData)
      .enter()
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', radius)
      .attr('fill', d => d.spaceTrack?.DECAYED ? '#f87171' : 'url(#circle-gradient)')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', radius * 1.5)
          .attr('opacity', 1)
          .attr('stroke-width', 2)

        tooltip.transition()
          .duration(200)
          .style('opacity', 1)
        
        tooltip.html(`
          <strong>${d.spaceTrack?.OBJECT_NAME || 'Unknown'}</strong><br/>
          <span>Altitude: ${d.height_km ? d.height_km.toFixed(2) : 'N/A'} km</span><br/>
          <span>Status: ${d.spaceTrack?.DECAYED ? 'Decayed' : 'Active'}</span><br/>
          <span>Version: ${d.version || 'N/A'}</span>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', radius)
          .attr('opacity', 0.7)
          .attr('stroke-width', 0.5)

        tooltip.transition()
          .duration(500)
          .style('opacity', 0)
      })

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat(d => `${d} km`)

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .attr('class', 'axis')
      .selectAll('text')
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('font-size', '12px')

    g.selectAll('.axis path, .axis line')
      .style('stroke', 'rgba(255, 255, 255, 0.2)')

    // Add X axis label
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Altitude (km)')

    // Add title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.9)')
      .style('font-size', '16px')
      .style('font-weight', '700')
      .text(`Distribution of ${validData.length} Starlink Satellites by Altitude`)

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${width - 150}, 10)`)

    legend.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 6)
      .attr('fill', 'url(#circle-gradient)')
      .attr('opacity', 0.7)

    legend.append('text')
      .attr('x', 15)
      .attr('y', 5)
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('font-size', '12px')
      .text('Active')

    legend.append('circle')
      .attr('cx', 0)
      .attr('cy', 20)
      .attr('r', 6)
      .attr('fill', '#f87171')
      .attr('opacity', 0.7)

    legend.append('text')
      .attr('x', 15)
      .attr('y', 25)
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('font-size', '12px')
      .text('Decayed')

    // Cleanup
    return () => {
      tooltip.remove()
    }
  }, [data, dimensions])

  return (
    <div className="beeswarm-container" ref={containerRef}>
      <svg ref={svgRef}></svg>
      {data && data.filter(d => d.height_km !== null).length === 0 && (
        <div className="no-data-message">
          No altitude data available for visualization
        </div>
      )}
    </div>
  )
}

export default BeeswarmChart

