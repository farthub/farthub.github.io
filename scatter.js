
let svg_scatter = d3.select("#scatter")
    .attr("viewBox", [0,0, width, height])
    .attr('transform', `translate(${margin.left},${margin.top})`);

currentState = "Arkansas";
let scatter_title;
let color_scatter = d3.scaleOrdinal(d3.schemeSet2);

let tooltip_scatter = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function loadScatter(crop, state){
    currentState = state;
    currentCrop = crop;

    let file = "./regression_data/" + state + "_" + crop +"_data.csv";

    var http = new XMLHttpRequest();
    function checkFileExist() {
        if (file.length === 0) {
            output.innerHTML = "Please enter File URL";
        } else {
            http.open('HEAD', file, false);
            http.send();
            if (http.status === 200) {
                return true;
            } else {
                return false;
            }
        }
    }

    if(checkFileExist()){
        d3.csv(file).then(function(d){
            // extract first two rows, make scatter with the rest
            line_data = d.slice(0,2);
            scatter_data = d.slice(2);
    
            let r_2 = parseFloat(line_data[0].temp);
            let num_points = parseInt(line_data[0].yield);
            let m = parseFloat(line_data[1].temp);
            let b = parseFloat(line_data[1].yield);

            let mouseover_scatter = function(d) {
                let html = `<b>R Squared:</b> <u>${r_2.toFixed(5)}</u></span><br/>
                            <b># of Data Points</b>: <u>${num_points}</u></span>`;

                tooltip_scatter.html(html)
                    .style('top', `${(d3.event.pageY) + 20}px`)
                    .style('left', `${(d3.event.pageX) - 20}px`)
                    .style('justify-content', 'center')
                    .transition()
                    .duration(100)
                    .style('opacity', 0.9)
            };

            let mouseout_scatter = function(d) {
                tooltip_scatter.transition()
                    .duration(100)
                    .style('opacity', 0);
            };

            let temp_domain = [];
            let yield_domain = [];
        
            scatter_data.forEach(element => {
                temp_domain.push(parseFloat(element.temp));
                yield_domain.push(parseFloat(element.yield));
            });
    
            let x1 = d3.min(temp_domain);
            let x2 = d3.max(temp_domain);
            let y1 = m*x1 + b;
            let y2 = m*x2 + b;
            
            console.log(x2);
            console.log(x1);
            x_scat = d3.scaleLinear().range([0, INNER_WIDTH]).domain([Math.floor(x1)-1,  Math.floor(x2)+ 1]);
            y_scat = d3.scaleLinear().range([INNER_HEIGHT, 0]).domain([-0.75, Math.floor(d3.max(yield_domain))+5.75]);

            let grid_1_scatter = svg_scatter.append('g')
            .attr('class', 'grid')
            .attr('transform', 'translate(0,' + INNER_HEIGHT + ')')
            .call(d3.axisBottom(x_scat).tickSize(-(INNER_HEIGHT)).tickFormat('').ticks(10));

            let grid_2_scatter = svg_scatter.append('g')
                .attr('class', 'grid')
                .call(d3.axisLeft(y_scat).tickSize(-(INNER_WIDTH)).tickFormat('').ticks(10));

            grid_1_scatter.selectAll("line")
                .style("stroke", "#9bb6cc");

            grid_2_scatter.selectAll("line")
                .style("stroke", "#9bb6cc");

            grid_1_scatter.style("fill", "#d0e6f7");
    
            let x_axis = svg_scatter.append("g")
                .attr('transform', 'translate(0,'+(height - margin.bottom - margin.top)+')')
                .call(d3.axisBottom(x_scat).tickSize(0).tickPadding(10));
            let y_axis = svg_scatter.append("g")
                .call(d3.axisLeft(y_scat).tickSize(0).tickPadding(10));

            x_axis.selectAll("line")
                .style("stroke", "#2a4d69");

            y_axis.selectAll("line")
                .style("stroke", "#2a4d69");

            x_axis.selectAll("text")
                .style("stroke", "#2a4d69");

            y_axis.selectAll("text")
                .style("stroke", "#2a4d69");


            //x label
            svg_scatter.append("text")
            .attr("transform", `translate(${width * .5},${height - 40})`)
            .style("text-anchor", "middle")
            .style("stroke", "#2a4d69")
            .text("Average Temperature (C)");
    
            //y label
            svg_scatter.append("text")
            .attr("transform", `translate(${-50},${height * 0.45}) rotate(${-90})`)
            .style("text-anchor", "middle")
            .style("stroke", "#2a4d69")
            .text("Average Yield (ton/ha)");
    
            scatter_title = svg_scatter.append('text')
                .attr('transform', `translate(${width * .5},${margin.top-10})`)
                .text('Average Temperature vs. '+ capitalizeFirstLetter(currentCrop) + ' Yield in ' + currentState)
                .style("text-anchor", "middle")
                .style("stroke", "#2a4d69");



            let dots = svg_scatter.selectAll("dot").data(scatter_data);
    
            dots.enter()
                .append("circle")
                .attr("cx", function (d) { return x_scat(d.temp); })
                .attr("cy", function (d) { return y_scat(d.yield); })
                .attr("r", 4)
                .style("fill",  "#f2cdb1")
                .style('stroke-width', 1)
                .style('stroke', '#666666')
    
            // draw line
            let line = svg_scatter.append("line")
                                .style("stroke", "#3f5e78")
                                .style("stroke-width", 7)
                                .style('stroke-linecap', 'round')
                                .on("mouseover", mouseover_scatter)
                                .on("mouseout", mouseout_scatter)
                                .attr("x1", x_scat(x1))
                                .attr("x2", x_scat(x2))
                                .attr("y1", y_scat(y1))
                                .attr("y2", y_scat(y2));
    
        });
    }
    else{
        //display not enough data found
        svg_scatter.append("text")
            .attr("transform", `translate(${width*0.5},${height * 0.5})`)
            .style("text-anchor", "middle")
            .text("No Data Available");
    }
    
}

loadScatter(currentCrop, currentState);


