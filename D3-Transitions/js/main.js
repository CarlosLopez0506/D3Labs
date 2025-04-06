// Disclaimer: Some cool transitions were added with the help of ChatGPT o3-mini-high.

d3.json("data/revenues.json")
    .then(rawData => {
        rawData.forEach(d => {
            d.revenue = +d.revenue;
            d.profit = +d.profit;
        });

        const config = {
            width: 600,
            height: 400,
            margin: { left: 100, right: 10, top: 10, bottom: 100 }
        };
        config.chartWidth = config.width - config.margin.left - config.margin.right;
        config.chartHeight = config.height - config.margin.top - config.margin.bottom;

        const svg = d3.select('#chart-area')
            .append('svg')
            .attr("width", config.width + config.margin.left + config.margin.right)
            .attr("height", config.height + config.margin.top + config.margin.bottom)
            .style('background', '#1a1a1a');

        const g = svg.append('g')
            .attr("transform", `translate(${config.margin.left}, ${config.margin.top})`);

        const xScale = d3.scaleBand()
            .domain(rawData.map(d => d.month))
            .range([0, config.chartWidth])
            .paddingInner(0.3)
            .paddingOuter(0.3);

        const yScale = d3.scaleLinear()
            .range([config.chartHeight, 0]);

        const xAxis = d3.axisBottom(xScale);
        const xAxisGroup = g.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0, ${config.chartHeight})`)
            .call(xAxis);

        xAxisGroup.selectAll("text")
            .attr("text-anchor", "middle")
            .style("fill", "white");
        xAxisGroup.selectAll(".domain, .tick line")
            .style("stroke", "white");

        const yAxis = d3.axisLeft(yScale).tickFormat(d => "$" + (d / 1000) + "K");
        const yAxisGroup = g.append('g').attr('class', 'y axis');

        svg.append('text')
            .attr('x', config.chartWidth / 2 + config.margin.left)
            .attr('y', config.chartHeight + 50)
            .attr('text-anchor', 'middle')
            .attr('font-size', '20px')
            .style('fill', 'white')
            .text("Month");

        const yLabel = svg.append('text')
            .attr('x', -(config.height - config.margin.bottom - config.margin.top) / 2 - config.margin.top)
            .attr('y', config.margin.left / 2)
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'middle')
            .attr('font-size', '20px')
            .style('fill', 'white')
            .text("Revenue (dlls.)");

        let flag = true;
        const t = d3.transition().duration(1500); // increased duration

        function update(data) {
            const field = flag ? "revenue" : "profit";
            xScale.domain(data.map(d => d.month));
            yScale.domain([0, d3.max(data, d => d[field])]);

            xAxisGroup.transition(t)
                .call(d3.axisBottom(xScale))
                .selectAll("text")
                .attr("text-anchor", "middle")
                .style("fill", "white");
            xAxisGroup.selectAll(".domain, .tick line")
                .style("stroke", "white");

            yAxisGroup.transition(t)
                .call(d3.axisLeft(yScale).tickFormat(d => "$" + (d / 1000) + "K"))
                .selectAll("text")
                .style("fill", "white");
            yAxisGroup.selectAll(".domain, .tick line")
                .style("stroke", "white");

            const rects = g.selectAll("rect").data(data, d => d.month);

            rects.exit()
                .attr("fill", "red")
                .transition(t)
                .attr("y", yScale(0))
                .attr("height", 0)
                .remove();

            rects.enter().append("rect")
                .attr("fill", "grey")
                .attr("x", d => xScale(d.month))
                .attr("y", yScale(0))
                .attr("width", xScale.bandwidth())
                .attr("height", 0)
                .merge(rects)
                .transition(t)
                .attr("x", d => xScale(d.month))
                .attr("width", xScale.bandwidth())
                .attr("y", d => yScale(d[field]))
                .attr("height", d => config.chartHeight - yScale(d[field]))
                .attr("fill", "yellow");

            yLabel.text(flag ? "Revenue (dlls.)" : "Profit (dlls.)");
        }

        d3.interval(() => {
            const newData = flag ? rawData : rawData.slice(1);
            update(newData);
            flag = !flag;
        }, 1000);

        update(rawData);
    })
    .catch(console.error);
