d3.json("data/buildings.json").then(buildingData => {
    const width = 900;
    const height = 900;
    
    const svg = d3.select("#chart-area")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    const xScale = d3.scaleBand()
        .domain(buildingData.map(building => building.name))
        .range([0, width])
        .padding(0.2);
    
    svg.selectAll("rect")
        .data(buildingData)
        .enter()
        .append("rect")
        .attr("x", (building, index) => xScale(building.name) + (index))
        .attr("y", building => height - building.height)
        .attr("width", xScale.bandwidth())
        .attr("height", building => building.height)
        .attr("fill", "steelblue");
});
