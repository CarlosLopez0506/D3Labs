var svg = d3.select("#chart-area").append("svg")
    .attr("width", 1000)
    .attr("height", 1200);

var circle = svg.append("circle")
    .attr("cx", 250)
    .attr("cy", 250)
    .attr("r", 100)
    .attr("fill", "green");

var rect = svg.append("rect")
    .attr("x", 20)
    .attr("y", 20)
    .attr("width", 200)
    .attr("height", 300)
    .attr("fill", "yellow");
