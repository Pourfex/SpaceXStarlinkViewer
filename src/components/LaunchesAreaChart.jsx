import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import './LaunchesAreaChart.css'

function LaunchesAreaChart({ data }) {
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

    // Filter data with valid launch dates
    const validData = data.filter(d => d.spaceTrack?.LAUNCH_DATE)

    if (validData.length === 0) return

    // Parse dates and group by year
    const launchByYear = d3.rollup(
      validData,
      v => v.length,
      d => new Date(d.spaceTrack.LAUNCH_DATE).getFullYear()
    )

    // Convert to array and sort by year
    const yearData = Array.from(launchByYear, ([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year)

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
      .domain(d3.extent(yearData, d => d.year))
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(yearData, d => d.count)])
      .range([height, 0])
      .nice()

    // Create gradient for area
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#667eea')
      .attr('stop-opacity', 0.8)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#764ba2')
      .attr('stop-opacity', 0.2)

    // Create area generator
    const area = d3.area()
      .x(d => xScale(d.year))
      .y0(height)
      .y1(d => yScale(d.count))
      .curve(d3.curveMonotoneX)

    // Create line generator for the top edge
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.count))
      .curve(d3.curveMonotoneX)

    // Add the area
    g.append('path')
      .datum(yearData)
      .attr('class', 'area')
      .attr('d', area)
      .attr('fill', 'url(#area-gradient)')
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .attr('opacity', 1)

    // Add the line
    g.append('path')
      .datum(yearData)
      .attr('class', 'line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#667eea')
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')

    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'area-chart-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none')

    // Add circles at data points
    g.selectAll('circle')
      .data(yearData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.count))
      .attr('r', 5)
      .attr('fill', '#667eea')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8)

        tooltip.transition()
          .duration(200)
          .style('opacity', 1)
        
        tooltip.html(`
          <strong>Year ${d.year}</strong><br/>
          <span>${d.count} launches</span>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 5)

        tooltip.transition()
          .duration(500)
          .style('opacity', 0)
      })

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format('d'))
      .ticks(Math.min(yearData.length, 10))

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .attr('class', 'axis')
      .selectAll('text')
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('font-size', '12px')

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
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Year')

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Number of Launches')

    // Add title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.9)')
      .style('font-size', '16px')
      .style('font-weight', '700')
      .text('Starlink Launches Through the Years')

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

    // Cleanup
    return () => {
      tooltip.remove()
    }
  }, [data, dimensions])

  return (
    <div className="area-chart-container" ref={containerRef}>
      <svg ref={svgRef}></svg>
      {data && data.filter(d => d.spaceTrack?.LAUNCH_DATE).length === 0 && (
        <div className="no-data-message">
          No launch date data available for visualization
        </div>
      )}
    </div>
  )
}

export default LaunchesAreaChart

