import { Component, Input, ViewChild, ElementRef, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-launches-area-chart',
  standalone: true,
  template: `
    <div class="area-chart-container" #container>
      <svg #svg></svg>
      @if (hasNoData) {
        <div class="no-data-message">
          No launch date data available for visualization
        </div>
      }
    </div>
  `,
  styles: [`
    .area-chart-container {
      width: 100%;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 1rem;
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .area-chart-container svg {
      display: block;
      margin: 0 auto;
    }

    .no-data-message {
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      font-size: 1.1rem;
      padding: 2rem;
    }

    .area {
      transition: opacity 0.3s ease;
    }

    .line {
      filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.5));
    }

    .grid line {
      stroke: rgba(255, 255, 255, 0.05);
      stroke-dasharray: 3, 3;
    }

    .grid path {
      stroke-width: 0;
    }
  `],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class AppComponent implements OnChanges {
  @Input() data: string = '[]';
  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  
  hasNoData = false;
  private tooltip: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.renderChart();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderChart(), 0);
  }

  private renderChart(): void {
    const parsedData = JSON.parse(this.data);
    
    if (!parsedData || parsedData.length === 0) return;

    // Clear previous chart
    d3.select(this.svgRef.nativeElement).selectAll('*').remove();

    // Filter data with valid launch dates
    const validData = parsedData.filter((d: any) => d.spaceTrack?.LAUNCH_DATE);

    this.hasNoData = validData.length === 0;
    if (this.hasNoData) return;

    // Parse dates and group by year
    const launchByYear = d3.rollup(
      validData,
      (v: any) => v.length,
      (d: any) => new Date(d.spaceTrack.LAUNCH_DATE).getFullYear()
    );

    // Convert to array and sort by year
    const yearData = Array.from(launchByYear, ([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year);

    // Set up dimensions
    const width = this.containerRef.nativeElement.offsetWidth;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(this.svgRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(yearData, d => d.year) as [number, number])
      .range([0, chartWidth]);

    const maxCount = (d3.max(yearData, d => d.count) as unknown as number) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, maxCount])
      .range([chartHeight, 0])
      .nice();

    // Create gradient for area
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#667eea')
      .attr('stop-opacity', 0.8);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#764ba2')
      .attr('stop-opacity', 0.2);

    // Create area generator
    const area = d3.area<any>()
      .x(d => xScale(d.year))
      .y0(chartHeight)
      .y1(d => yScale(d.count))
      .curve(d3.curveMonotoneX);

    // Create line generator for the top edge
    const line = d3.line<any>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.count))
      .curve(d3.curveMonotoneX);

    // Add the area
    g.append('path')
      .datum(yearData)
      .attr('class', 'area')
      .attr('d', area)
      .attr('fill', 'url(#area-gradient)')
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .attr('opacity', 1);

    // Add the line
    g.append('path')
      .datum(yearData)
      .attr('class', 'line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#667eea')
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round');

    // Create tooltip if not exists
    if (!this.tooltip) {
      this.tooltip = d3.select('body').append('div')
        .attr('class', 'area-chart-tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('background', 'rgba(0, 0, 0, 0.95)')
        .style('border', '1px solid rgba(102, 126, 234, 0.5)')
        .style('border-radius', '8px')
        .style('padding', '12px')
        .style('font-size', '14px')
        .style('box-shadow', '0 4px 20px rgba(0, 0, 0, 0.5)')
        .style('z-index', '1000')
        .style('backdrop-filter', 'blur(10px)');
    }

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
      .on('mouseover', (event: any, d: any) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', 8);

        this.tooltip.transition()
          .duration(200)
          .style('opacity', 1);
        
        this.tooltip.html(`
          <strong style="color: #667eea; display: block; margin-bottom: 6px; font-size: 15px;">Year ${d.year}</strong>
          <span style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 13px;">${d.count} launches</span>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', (event: any) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', 5);

        this.tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format('d'))
      .ticks(Math.min(yearData.length, 10));

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .attr('class', 'axis')
      .selectAll('text')
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('font-size', '12px');

    g.selectAll('.axis path, .axis line')
      .style('stroke', 'rgba(255, 255, 255, 0.2)');

    // Add Y axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(8);

    g.append('g')
      .call(yAxis)
      .attr('class', 'axis')
      .selectAll('text')
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('font-size', '12px');

    // Add X axis label
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 45)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Year');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Number of Launches');

    // Add title
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.9)')
      .style('font-size', '16px')
      .style('font-weight', '700')
      .text('Starlink Launches Through the Years');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .ticks(8)
        .tickSize(-chartWidth)
        .tickFormat(() => '')
      )
      .style('stroke', 'rgba(255, 255, 255, 0.05)')
      .style('stroke-dasharray', '3,3');
  }

  ngOnDestroy(): void {
    if (this.tooltip) {
      this.tooltip.remove();
    }
  }
}
