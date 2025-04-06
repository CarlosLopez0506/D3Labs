const margin = {top: 50, right: 150, bottom: 50, left: 80};
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

d3.select("body")
    .style("background-color", "#1c1c1c")
    .style("color", "#fff")
    .style("font-family", "sans-serif");

const svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .style("background-color", "black");

const xScale = d3.scaleLog()
    .base(10)
    .domain([142, 150000])
    .range([0, width]);

const yScale = d3.scaleLinear()
    .domain([0, 90])
    .range([height, 0]);

const areaScale = d3.scaleLinear()
    .domain([2000, 1400000000])
    .range([25 * Math.PI, 1500 * Math.PI]);

const colorScale = d3.scaleOrdinal(d3.schemePastel1);

const xAxis = d3.axisBottom(xScale)
    .tickValues([400, 4000, 40000])
    .tickFormat(d => "$" + d);
const yAxis = d3.axisLeft(yScale);

svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

svg.selectAll(".x-axis text, .y-axis text")
    .attr("fill", "white");

svg.selectAll(".x-axis path, .y-axis path, .x-axis line, .y-axis line")
    .attr("stroke", "white");

svg.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text("Income (GDP per Capita)");

svg.append("text")
    .attr("class", "axis-label")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text("Life Expectancy");

const yearLabel = svg.append("text")
    .attr("class", "yearLabel")
    .attr("x", width)
    .attr("y", height - 10)
    .attr("text-anchor", "end")
    .style("font-size", "40px")
    .style("opacity", 0.5)
    .attr("fill", "white")
    .text("");

const legendGroup = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 75}, 250)`);

d3.json("data/data.json").then(rawData => {
    const formattedData = rawData.map(yearData => ({
        year: yearData.year,
        countries: yearData.countries
            .filter(country => country.income && country.life_exp)
            .map(country => ({
                country: country.country,
                continent: country.continent,
                income: +country.income,
                life_exp: +country.life_exp,
                population: +country.population
            }))
    }));

    const continents = Array.from(new Set(
        formattedData.flatMap(year => year.countries.map(c => c.continent))
    ));
    colorScale.domain(continents);
    function capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    const legend = legendGroup.selectAll("g")
        .data(continents)
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    legend.append("text")
        .attr("x", 50)
        .attr("y", 12)
        .attr("text-anchor", "end")
        .attr("fill", "white")
        .text(d => capitalizeWords(d));

    legend.append("rect")
        .attr("x", 60)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => colorScale(d));

    let yearIndex = 0;

    const update = dataYear => {
        yearLabel.text(dataYear.year);

        const circles = svg.selectAll("circle")
            .data(dataYear.countries, d => d.country);

        circles.exit().remove();

        circles.transition().duration(500)
            .attr("cx", d => xScale(d.income))
            .attr("cy", d => yScale(d.life_exp))
            .attr("r", d => Math.sqrt(areaScale(d.population) / Math.PI))
            .attr("fill", d => colorScale(d.continent));

        circles.enter()
            .append("circle")
            .attr("cx", d => xScale(d.income))
            .attr("cy", d => yScale(d.life_exp))
            .attr("r", 0)
            .attr("fill", d => colorScale(d.continent))
            .transition().duration(1000)
            .attr("r", d => Math.sqrt(areaScale(d.population) / Math.PI));
    };

    update(formattedData[yearIndex]);

    d3.interval(() => {
        yearIndex = (yearIndex + 1) % formattedData.length;
        update(formattedData[yearIndex]);
    }, 500);
}).catch(error => {
    console.error("Error loading the data:", error);
});
