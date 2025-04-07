var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", 400)
    .attr("height", 400);

d3.json("data/ages.json").then((data) => {
    
    data.forEach((d) => {
        d.age = +d.age;
    });

    console.log(data);

    var circles = svg.selectAll("circle")
        .data(data);

    circles.enter()
        .append("circle")
        .attr("cx", (d, i) => (i + 1) * 50)
        .attr("cy", 200)
        .attr("r", d => d.age * 2)
        .attr("fill", d => d.age > 10 ? "yellow" : "steelblue");

}).catch((error) => {
    console.error("Error al cargar los datos:", error);
});
