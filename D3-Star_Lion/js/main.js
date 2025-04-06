d3.json("data/revenues.json").then(data => {
    data.forEach(d => {
        d.revenue = +d.revenue;
    });

    const width = 600;
    const height = 400;

    const margin = { left: 100, right: 10, top: 10, bottom: 100 };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select('#chart-area')
        .append('svg')
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)

    const g = svg.append('g')
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    const x = d3.scaleBand()
        .domain(data.map(d => d.month))
        .range([0, chartWidth])
        .paddingInner(0.3)
        .paddingOuter(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.revenue)])
        .range([chartHeight, 0]);

    g.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => x(d.month))
        .attr('y', d => y(d.revenue))
        .attr('width', x.bandwidth())
        .attr('height', d => chartHeight - y(d.revenue))
        .attr('fill', 'yellow');

    const xAxis = d3.axisBottom(x);
    g.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(xAxis)
        .selectAll("text")
        .attr("text-anchor", "middle")

    const yAxis = d3.axisLeft(y)
        .tickFormat(d => "$" + (d / 1000) + "K");
    g.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    g.selectAll('.tick text')
        .style('fill', 'white');

    g.selectAll('.domain, .tick line')
        .style('stroke', 'white');

    svg.append('text')
        .attr('x', chartWidth / 2 + margin.left)
        .attr('y', chartHeight + 50)
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .style('fill', 'white') // <--- Add this
        .text("Month");

    svg.append('text')
        .attr('x', -(height - margin.bottom - margin.top) / 2 - margin.top)
        .attr('y', margin.left / 2)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .style('fill', 'white') // <--- Add this
        .text("Revenue (dlls.)");

    svg.style('background', '#1a1a1a');

});
