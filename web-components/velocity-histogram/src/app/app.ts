import { Component, Input, ViewChild, ElementRef, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-velocity-histogram',
  standalone: true,
  template: `
    <div class="histogram-container" #container>
      <svg #svg></svg>
      @if (hasNoData) {
        <div class="no-data-message">
          No velocity data available for visualization
        </div>
      }
    </div>
  `,
  styles: [`
    .histogram-container {
      width: 100%;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 1rem;
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .histogram-container svg {
      display: block;
      margin: 0 auto;
    }

    .no-data-message {
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      font-size: 1.1rem;
      padding: 2rem;
    }

    rect {
      transition: all 0.3s ease;
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

    // Filter data with valid velocity
    const validData = parsedData.filter((d: any) => d.velocity_kms !== null && !isNaN(d.velocity_kms));

    this.hasNoData = validData.length === 0;
    if (this.hasNoData) return;

    // Set up dimensions
    const width = this.containerRef.nativeElement.offsetWidth;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(this.svgRef.nativeElement)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const extent = d3.extent(validData, (d: any) => d.velocity_kms) as unknown as [number, number];
    const xScale = d3.scaleLinear()
      .domain(extent)
      .range([0, chartWidth])
      .nice();

    // Create histogram bins
    const histogram = d3.histogram()
      .value((d: any) => d.velocity_kms)
      .domain(xScale.domain() as [number, number])
      .thresholds(20);

    const bins = histogram(validData as any);

    // Y scale
    const maxLength = (d3.max(bins, d => d.length) as unknown as number) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, maxLength])
      .range([chartHeight, 0])
      .nice();

    // Create gradient for bars
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'bar-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#764ba2')
      .attr('stop-opacity', 0.8);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#667eea')
      .attr('stop-opacity', 0.9);

    // Create tooltip if not exists
    if (!this.tooltip) {
      this.tooltip = d3.select('body').append('div')
        .attr('class', 'histogram-tooltip')
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

    // Add bars
    g.selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', (d: any) => xScale(d.x0) + 1)
      .attr('width', (d: any) => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
      .attr('y', chartHeight)
      .attr('height', 0)
      .attr('fill', 'url(#bar-gradient)')
      .attr('stroke', 'rgba(255, 255, 255, 0.2)')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event: any, d: any) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', '#667eea')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);

        this.tooltip.transition()
          .duration(200)
          .style('opacity', 1);
        
        const avgVelocity = d3.mean(d, (sat: any) => sat.velocity_kms) as number;
        
        this.tooltip.html(`
          <strong style="color: #667eea; display: block; margin-bottom: 6px; font-size: 15px;">Velocity Range</strong>
          <span style="display: block; color: rgba(255, 255, 255, 0.9); margin-bottom: 3px; font-size: 13px;">${d.x0.toFixed(2)} - ${d.x1.toFixed(2)} km/s</span>
          <span style="display: block; color: rgba(255, 255, 255, 0.9); margin-bottom: 3px; font-size: 13px;"><strong>${d.length}</strong> satellites</span>
          <span style="display: block; color: rgba(255, 255, 255, 0.9); margin-top: 3px; padding-top: 3px; border-top: 1px solid rgba(255, 255, 255, 0.2); font-size: 13px;">Avg: ${avgVelocity.toFixed(2)} km/s</span>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', (event: any) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', 'url(#bar-gradient)')
          .attr('stroke', 'rgba(255, 255, 255, 0.2)')
          .attr('stroke-width', 1);

        this.tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      })
      .transition()
      .duration(800)
      .delay((d: any, i: number) => i * 30)
      .attr('y', (d: any) => yScale(d.length))
      .attr('height', (d: any) => chartHeight - yScale(d.length));

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat((d: any) => `${d.toFixed(1)} km/s`);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .attr('class', 'axis')
      .selectAll('text')
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('font-size', '11px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

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
      .attr('y', chartHeight + 50)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Velocity (km/s)');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Number of Satellites');

    // Add title
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.9)')
      .style('font-size', '16px')
      .style('font-weight', '700')
      .text(`Velocity Distribution (${validData.length} satellites)`);

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

    // Add statistics box
    const stats = g.append('g')
      .attr('transform', `translate(${chartWidth - 180}, 10)`);

    const meanVelocity = d3.mean(validData, (d: any) => d.velocity_kms) as number;
    const medianVelocity = d3.median(validData, (d: any) => d.velocity_kms) as number;

    stats.append('rect')
      .attr('width', 170)
      .attr('height', 60)
      .attr('fill', 'rgba(0, 0, 0, 0.4)')
      .attr('stroke', 'rgba(102, 126, 234, 0.3)')
      .attr('stroke-width', 1)
      .attr('rx', 5);

    stats.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .style('fill', 'rgba(255, 255, 255, 0.9)')
      .style('font-size', '11px')
      .text(`Mean: ${meanVelocity.toFixed(3)} km/s`);

    stats.append('text')
      .attr('x', 10)
      .attr('y', 40)
      .style('fill', 'rgba(255, 255, 255, 0.9)')
      .style('font-size', '11px')
      .text(`Median: ${medianVelocity.toFixed(3)} km/s`);
  }

  ngOnDestroy(): void {
    if (this.tooltip) {
      this.tooltip.remove();
    }
  }
}
