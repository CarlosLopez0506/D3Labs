// Base styles for the page and chart
d3.select("body")
    .style("background-color", "#1c1c1c")
    .style("color", "#fff")
    .style("font-family", "sans-serif");

// Top bar with controls
const topBar = d3.select("body")
    .append("div")
    .attr("id", "top-bar")
    .style("display", "flex")
    .style("align-items", "center")
    .style("gap", "10px")
    .style("padding", "10px");

const playPauseButton = topBar.append("button")
    .attr("id", "play-pause")
    .text("Play")
    .style("background-color", "#333")
    .style("color", "#fff")
    .style("border", "1px solid #555")
    .style("padding", "5px 10px")
    .style("cursor", "pointer");

const resetButton = topBar.append("button")
    .attr("id", "reset")
    .text("Reset")
    .style("background-color", "#333")
    .style("color", "#fff")
    .style("border", "1px solid #555")
    .style("padding", "5px 10px")
    .style("cursor", "pointer");

topBar.append("label")
    .attr("for", "year-slider")
    .style("font-size", "14px")
    .html('Year: <span id="slider-label">1800</span>');

const yearSlider = topBar.append("input")
    .attr("type", "range")
    .attr("id", "year-slider")
    .style("width", "150px");

const dropdown = topBar.append("select")
    .attr("id", "continent-select")
    .style("width", "150px")
    .style("margin-left", "auto")
    .style("background-color", "#333")
    .style("color", "#fff")
    .style("border", "1px solid #555")
    .style("padding", "5px")
    .style("cursor", "pointer");

// Chart area
const chartArea = d3.select("body")
    .append("div")
    .attr("id", "chart-area")
    .style("text-align", "center")
    .style("margin-top", "20px");

const margin = { top: 50, right: 150, bottom: 50, left: 80 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = chartArea.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .style("background-color", "black");

// Scales and axes
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
    .call(xAxis)
    .selectAll("text")
    .style("fill", "white");

svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .selectAll("text")
    .style("fill", "white");

svg.selectAll(".x-axis path, .x-axis line")
    .attr("stroke", "white");
svg.selectAll(".y-axis path, .y-axis line")
    .attr("stroke", "white");

svg.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + 35)
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .text("GDP Per Capita ($)");

svg.append("text")
    .attr("class", "axis-label")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .text("Life Expectancy (Years)");

const yearLabel = svg.append("text")
    .attr("class", "yearLabel")
    .attr("x", width)
    .attr("y", height - 10)
    .attr("text-anchor", "end")
    .style("font-size", "40px")
    .style("opacity", 0.7)
    .style("fill", "white")
    .text("");

// Tooltip setup
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

// Legend
const legendGroup = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 90}, 250)`);

// Load and format the data
d3.json("data/data.json").then(rawData => {
    console.log("Raw data:", rawData);

    // Map the raw data. Ensure every country is returned as an object.
    const formattedData = rawData.map(yearData => ({
        // Use a default value for year if missing
        year: yearData.year || "Unknown",
        countries: yearData.countries
            // Only use entries with non-null income and life_exp
            .filter(d => d.income != null && d.life_exp != null)
            .map(d => {
                const cleanIncome = parseFloat(d.income.toString().replace(/[$,]/g, ""));
                const cleanLifeExp = parseFloat(d.life_exp.toString());
                const cleanPopulation = parseFloat(d.population.toString().replace(/[,]/g, ""));
                return {
                    country: d.country,
                    continent: d.continent,
                    income: cleanIncome,
                    life_exp: cleanLifeExp,
                    population: cleanPopulation
                };
            })
    }));

    console.log("Formatted data:", formattedData);

    // Get unique continents for legend and dropdown
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

    const legendWidth = 70;

    legend.append("text")
        .attr("x", legendWidth)
        .attr("y", 12)
        .attr("text-anchor", "end")
        .text(d => capitalizeWords(d))
        .style("fill", "white");

    legend.append("rect")
        .attr("x", legendWidth + 5)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => colorScale(d));

    dropdown.append("option")
        .attr("value", "all")
        .text("All");
    continents.forEach(continent => {
        dropdown.append("option")
            .attr("value", continent)
            .text(capitalizeWords(continent));
    });

    // Set up slider
    yearSlider
        .attr("min", 0)
        .attr("max", formattedData.length - 1)
        .attr("value", 0);
    d3.select("#slider-label").text(formattedData[0].year);

    let yearIndex = 0;
    let isPlaying = false;
    let selectedContinent = "all";
    let timer;

    // Update function to draw circles and attach tooltip events
    function update(dataYear) {
        yearLabel.text(dataYear.year);
        const filteredCountries = selectedContinent === "all"
            ? dataYear.countries
            : dataYear.countries.filter(d => d.continent === selectedContinent);

        // Bind data to circles (using country as key)
        const circles = svg.selectAll("circle")
            .data(filteredCountries, d => d.country);

        circles.exit().remove();

        const circlesEnter = circles.enter()
            .append("circle")
            .attr("cx", d => xScale(d.income))
            .attr("cy", d => yScale(d.life_exp))
            .attr("r", 0)
            .attr("fill", d => colorScale(d.continent));

        circlesEnter.merge(circles)
            .on("mouseover", (d) => {
                console.log("Hovered data:", d);
                tooltip.transition().duration(200).style("opacity", 1);
                const populationText = (d.population !== undefined && !isNaN(d.population))
                    ? d.population.toLocaleString()
                    : "N/A";
                tooltip.html(`
            <strong>Country:</strong> ${d.country}<br/>
            <strong>Continent:</strong> ${capitalizeWords(d.continent)}<br/>
            <strong>Income:</strong> $${d.income}<br/>
            <strong>Life Expectancy:</strong> ${d.life_exp}<br/>
            <strong>Population:</strong> ${populationText}
          `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mousemove", event => {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(200).style("opacity", 0);
            })
            .transition().duration(1000)
            .attr("cx", d => xScale(d.income))
            .attr("cy", d => yScale(d.life_exp))
            .attr("r", d => Math.sqrt(areaScale(d.population) / Math.PI))
            .attr("fill", d => colorScale(d.continent));
    }

    update(formattedData[yearIndex]);

    function play() {
        isPlaying = true;
        playPauseButton.text("Pause");
        timer = d3.interval(() => {
            yearIndex = (yearIndex + 1) % formattedData.length;
            update(formattedData[yearIndex]);
            yearSlider.property("value", yearIndex);
            d3.select("#slider-label").text(formattedData[yearIndex].year);
        }, 1000);
    }

    function pause() {
        isPlaying = false;
        playPauseButton.text("Play");
        if (timer) timer.stop();
    }

    playPauseButton.on("click", () => {
        isPlaying ? pause() : play();
    });

    resetButton.on("click", () => {
        pause();
        yearIndex = 0;
        update(formattedData[yearIndex]);
        yearSlider.property("value", yearIndex);
        d3.select("#slider-label").text(formattedData[yearIndex].year);
    });

    yearSlider.on("input", function() {
        pause();
        yearIndex = +this.value;
        update(formattedData[yearIndex]);
        d3.select("#slider-label").text(formattedData[yearIndex].year);
    });

    dropdown.on("change", function() {
        selectedContinent = this.value;
        update(formattedData[yearIndex]);
    });

}).catch(error => {
    console.error("Error loading the data:", error);
});