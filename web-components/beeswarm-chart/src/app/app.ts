import { Component, Input, ViewChild, ElementRef, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-beeswarm-chart',
  standalone: true,
  template: `
    <div class="beeswarm-container" #container>
      <svg #svg></svg>
      @if (hasNoData) {
        <div class="no-data-message">
          No altitude data available for visualization
        </div>
      }
    </div>
  `,
  styles: [`
    .beeswarm-container {
      width: 100%;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 1rem;
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .beeswarm-container svg {
      display: block;
      margin: 0 auto;
    }

    .no-data-message {
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      font-size: 1.1rem;
      padding: 2rem;
    }

    .axis text {
      fill: rgba(255, 255, 255, 0.7);
    }

    .axis path,
    .axis line {
      stroke: rgba(255, 255, 255, 0.2);
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

    // Filter data to only include satellites with valid height_km
    const validData = parsedData.filter((d: any) => d.height_km !== null && !isNaN(d.height_km));
    
    this.hasNoData = validData.length === 0;
    if (this.hasNoData) return;

    // Set up dimensions
    const width = this.containerRef.nativeElement.offsetWidth;
    const height = 300;
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
    const maxHeight = (d3.max(validData, (d: any) => d.height_km) as unknown as number) || 0;
    const xScale = d3.scaleLinear()
      .domain([0, maxHeight])
      .range([0, chartWidth])
      .nice();

    // Create simulation for beeswarm
    const radius = 4;
    const simulation = d3.forceSimulation(validData)
      .force('x', d3.forceX((d: any) => xScale(d.height_km)).strength(1))
      .force('y', d3.forceY(chartHeight / 2).strength(0.1))
      .force('collide', d3.forceCollide(radius + 0.5))
      .stop();

    // Run simulation
    for (let i = 0; i < 120; i++) simulation.tick();

    // Add gradient definition
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'circle-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#667eea')
      .attr('stop-opacity', 0.8);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#764ba2')
      .attr('stop-opacity', 0.8);

    // Create tooltip if not exists
    if (!this.tooltip) {
      this.tooltip = d3.select('body').append('div')
        .attr('class', 'beeswarm-tooltip')
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

    // Add circles
    g.selectAll('circle')
      .data(validData)
      .enter()
      .append('circle')
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', radius)
      .attr('fill', (d: any) => d.spaceTrack?.DECAYED ? '#f87171' : 'url(#circle-gradient)')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('mouseover', (event: any, d: any) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', radius * 1.5)
          .attr('opacity', 1)
          .attr('stroke-width', 2);

        this.tooltip.transition()
          .duration(200)
          .style('opacity', 1);
        
        this.tooltip.html(`
          <strong style="color: #667eea; display: block; margin-bottom: 6px; font-size: 15px;">${d.spaceTrack?.OBJECT_NAME || 'Unknown'}</strong>
          <span style="display: block; color: rgba(255, 255, 255, 0.9); margin-bottom: 3px; font-size: 13px;">Altitude: ${d.height_km ? d.height_km.toFixed(2) : 'N/A'} km</span>
          <span style="display: block; color: rgba(255, 255, 255, 0.9); margin-bottom: 3px; font-size: 13px;">Status: ${d.spaceTrack?.DECAYED ? 'Decayed' : 'Active'}</span>
          <span style="display: block; color: rgba(255, 255, 255, 0.9); font-size: 13px;">Version: ${d.version || 'N/A'}</span>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', (event: any) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', radius)
          .attr('opacity', 0.7)
          .attr('stroke-width', 0.5);

        this.tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat((d: any) => `${d} km`);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .attr('class', 'axis')
      .selectAll('text')
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('font-size', '12px');

    g.selectAll('.axis path, .axis line')
      .style('stroke', 'rgba(255, 255, 255, 0.2)');

    // Add X axis label
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 45)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .text('Altitude (km)');

    // Add title
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.9)')
      .style('font-size', '16px')
      .style('font-weight', '700')
      .text(`Distribution of ${validData.length} Starlink Satellites by Altitude`);

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${chartWidth - 150}, 10)`);

    legend.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 6)
      .attr('fill', 'url(#circle-gradient)')
      .attr('opacity', 0.7);

    legend.append('text')
      .attr('x', 15)
      .attr('y', 5)
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('font-size', '12px')
      .text('Active');

    legend.append('circle')
      .attr('cx', 0)
      .attr('cy', 20)
      .attr('r', 6)
      .attr('fill', '#f87171')
      .attr('opacity', 0.7);

    legend.append('text')
      .attr('x', 15)
      .attr('y', 25)
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('font-size', '12px')
      .text('Decayed');
  }

  ngOnDestroy(): void {
    if (this.tooltip) {
      this.tooltip.remove();
    }
  }
}
