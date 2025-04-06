d3.json("../../resources/data/buildings.json").then(data => {
    data.forEach(d => {
        d.height = +d.height;
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
        .domain(data.map(d => d.name))
        .range([0, chartWidth])
        .paddingInner(0.3)
        .paddingOuter(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.height)])
        .range([chartHeight, 0]);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(d3.schemeSet3);

    g.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.height))
        .attr('width', x.bandwidth())
        .attr('height', d => chartHeight - y(d.height))
        .attr('fill', d => color(d.name));

    const xAxis = d3.axisBottom(x);
    g.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(xAxis)
        .selectAll("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40) translate(-5,10)");

    const yAxis = d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d => d + " m");
    g.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    svg.append('text')
        .attr('x', chartWidth/ 2)
        .attr('y', chartHeight + 140)
        .attr('text-anchor', 'middle')
        .text("The world's tallest buildings");

    svg.append('text')
        .attr('x', -(height - margin.bottom - margin.top) / 2 - margin.top)
        .attr('y', 20)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text("Height (m)");
});
