import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import './VelocityHistogram.css'

function VelocityHistogram({ data }) {
  const svgRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useRef(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setDimensions({
          width: width,
          height: 400
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

    // Filter data with valid velocity
    const validData = data.filter(d => d.velocity_kms !== null && !isNaN(d.velocity_kms))

    if (validData.length === 0) return

    // Set up dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 70 }
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
      .domain(d3.extent(validData, d => d.velocity_kms))
      .range([0, width])
      .nice()

    // Create histogram bins
    const histogram = d3.histogram()
      .value(d => d.velocity_kms)
      .domain(xScale.domain())
      .thresholds(20)

    const bins = histogram(validData)

    // Y scale
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height, 0])
      .nice()

    // Create gradient for bars
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'bar-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#764ba2')
      .attr('stop-opacity', 0.8)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#667eea')
      .attr('stop-opacity', 0.9)

    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'histogram-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none')

    // Add bars
    g.selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.x0) + 1)
      .attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', 'url(#bar-gradient)')
      .attr('stroke', 'rgba(255, 255, 255, 0.2)')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', '#667eea')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)

        tooltip.transition()
          .duration(200)
          .style('opacity', 1)
        
        const avgVelocity = d3.mean(d, sat => sat.velocity_kms)
        
        tooltip.html(`
          <strong>Velocity Range</strong><br/>
          <span>${d.x0.toFixed(2)} - ${d.x1.toFixed(2)} km/s</span><br/>
          <span><strong>${d.length}</strong> satellites</span><br/>
          <span>Avg: ${avgVelocity.toFixed(2)} km/s</span>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', 'url(#bar-gradient)')
          .attr('stroke', 'rgba(255, 255, 255, 0.2)')
          .attr('stroke-width', 1)

        tooltip.transition()
          .duration(500)
          .style('opacity', 0)
      })
      .transition()
      .duration(800)
      .delay((d, i) => i * 30)
      .attr('y', d => yScale(d.length))
      .attr('height', d => height - yScale(d.length))

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat(d => `${d.toFixed(1)} km/s`)

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .attr('class', 'axis')
      .selectAll('text')
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('font-size', '11px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')

    g.selectAll('.axis path, .axis line')
      .style('stroke', 'rgba(255, 255, 255, 0.2)')

    // Add Y axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(8)

    g.append('g')
      .call(yAxis)
      .attr('class', 'axis')
      .selectAll('text')
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('font-size', '12px')

    // Add X axis label
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 50)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Velocity (km/s)')

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Number of Satellites')

    // Add title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.9)')
      .style('font-size', '16px')
      .style('font-weight', '700')
      .text(`Velocity Distribution (${validData.length} satellites)`)

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .ticks(8)
        .tickSize(-width)
        .tickFormat('')
      )
      .style('stroke', 'rgba(255, 255, 255, 0.05)')
      .style('stroke-dasharray', '3,3')

    // Add statistics box
    const stats = g.append('g')
      .attr('transform', `translate(${width - 180}, 10)`)

    const meanVelocity = d3.mean(validData, d => d.velocity_kms)
    const medianVelocity = d3.median(validData, d => d.velocity_kms)

    stats.append('rect')
      .attr('width', 170)
      .attr('height', 60)
      .attr('fill', 'rgba(0, 0, 0, 0.4)')
      .attr('stroke', 'rgba(102, 126, 234, 0.3)')
      .attr('stroke-width', 1)
      .attr('rx', 5)

    stats.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .style('fill', 'rgba(255, 255, 255, 0.9)')
      .style('font-size', '11px')
      .text(`Mean: ${meanVelocity.toFixed(3)} km/s`)

    stats.append('text')
      .attr('x', 10)
      .attr('y', 40)
      .style('fill', 'rgba(255, 255, 255, 0.9)')
      .style('font-size', '11px')
      .text(`Median: ${medianVelocity.toFixed(3)} km/s`)

    // Cleanup
    return () => {
      tooltip.remove()
    }
  }, [data, dimensions])

  return (
    <div className="histogram-container" ref={containerRef}>
      <svg ref={svgRef}></svg>
      {data && data.filter(d => d.velocity_kms !== null).length === 0 && (
        <div className="no-data-message">
          No velocity data available for visualization
        </div>
      )}
    </div>
  )
}

export default VelocityHistogram

