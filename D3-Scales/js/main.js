// Load the JSON data
d3.json("../../resources/data/buildings.json").then(data => {

    data.forEach(d => {
        d.height = +d.height;
    });

    const svg = d3.select('#chart-area')
        .append('svg')
        .attr('width', 500)
        .attr('height', 500);


    const x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, 400])
        .paddingInner(0.3)
        .paddingOuter(0.3);


    const y = d3.scaleLinear()
        .domain([0, 828])
        .range([0, 400]);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(d3.schemeSet3);

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.height))
        .attr('width', x.bandwidth())
        .attr('height', d => y(d.height))
        .attr('fill', d => color(d.name));
});
