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

        const yAxisGroup = g.append('g')
            .attr('class', 'y axis');

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

        function update(data) {
            const field = flag ? "revenue" : "profit";
            yScale.domain([0, d3.max(data, d => d[field])]);

            yAxisGroup.call(d3.axisLeft(yScale).tickFormat(d => "$" + (d / 1000) + "K"));
            yAxisGroup.selectAll("text").style("fill", "white");
            yAxisGroup.selectAll(".domain, .tick line").style("stroke", "white");

            const rects = g.selectAll("rect").data(data);

            rects.exit().remove();

            rects
                .attr("x", d => xScale(d.month))
                .attr("y", d => yScale(d[field]))
                .attr("width", xScale.bandwidth())
                .attr("height", d => config.chartHeight - yScale(d[field]))
                .attr("fill", "yellow");

            rects.enter().append("rect")
                .attr("fill", "yellow")
                .attr("x", d => xScale(d.month))
                .attr("y", d => yScale(d[field]))
                .attr("width", xScale.bandwidth())
                .attr("height", d => config.chartHeight - yScale(d[field]));

            yLabel.text(flag ? "Revenue (dlls.)" : "Profit (dlls.)");
        }

        update(rawData);

        d3.interval(() => {
            flag = !flag;
            update(rawData);
        }, 1000);
    })
    .catch(console.error);
