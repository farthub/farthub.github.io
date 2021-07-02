let currentYear = 1981;
let currentCrop = "maize";
var output;
var data;
var graph;

let svg = d3.select("#gapminder")
            .attr("viewBox", [0,0, width, height])
            .attr('transform', `translate(${margin.left},${margin.top})`);

var title;

let INNER_HEIGHT = height - margin.bottom - margin.top;
let INNER_WIDTH = width - margin.left - margin.right;

let mouseover = function(d) {
    let html = `<b>${d.state}</b></span><br/>
                Average Temp (C): ${parseFloat(d.temp).toFixed(2)}</span><br/>
                Average Yield (ton/ha): ${parseFloat(d.yield).toFixed(2)}</span>`;
  
    tooltip.html(html)
        .style('top', `${(d3.event.pageY) + 20}px`)
        .style('left', `${(d3.event.pageX) - 20}px`)
        .style('justify-content', 'center')
        .transition()
        .duration(100)
        .style('opacity', 0.9)
};

let mouseout = function(d) {
    tooltip.transition()
        .duration(100)
        .style('opacity', 0);
};

function loadGraph(crop){
    currentCrop = crop;
    let data_file = './data/' + currentCrop + '_viz.csv';
    d3.csv(data_file).then(function(d){
        data = d;
        
        x = d3.scaleLinear().range([0, INNER_WIDTH]).domain([0, 24.05]);
        y = d3.scaleLinear().range([INNER_HEIGHT, 0]).domain([-0.75, 18.75]);
    
        let x_axis = svg.append("g")
            .attr('transform', 'translate(0,'+(height - margin.bottom - margin.top)+')')
            .call(d3.axisBottom(x).tickSize(0).tickPadding(10));
        let y_axis = svg.append("g")
            .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        x_axis.selectAll("line")
                .style("stroke", "#2a4d69");

        y_axis.selectAll("line")
            .style("stroke", "#2a4d69");

        x_axis.selectAll("text")
            .style("stroke", "#2a4d69");

        y_axis.selectAll("text")
            .style("stroke", "#2a4d69");

        //x label
        svg.append("text")
        .attr("transform", `translate(${width * .5},${height - 40})`)
        .style("text-anchor", "middle")
        .style("stroke", "#2a4d69")
        .text("Average Temperature (C)");

        //y label
        svg.append("text")
        .attr("transform", `translate(${-50},${height * 0.45}) rotate(${-90})`)
        .style("text-anchor", "middle")
        .style("stroke", "#2a4d69")
        .text("Average Yield (ton/ha)");

        let grid_1 = svg.append('g')
            .attr('class', 'grid')
            .attr('transform', 'translate(0,' + INNER_HEIGHT + ')')
            .call(d3.axisBottom(x).tickSize(-(INNER_HEIGHT)).tickFormat('').ticks(10));
        
        let grid_2 = svg.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(y).tickSize(-(INNER_WIDTH)).tickFormat('').ticks(10));

        grid_1.selectAll("line")
            .style("stroke", "#9bb6cc");

        grid_2.selectAll("line")
            .style("stroke", "#9bb6cc");

        grid_1.style("fill", "#d0e6f7");

        title = svg.append('text')
            .attr('transform', `translate(${width * .5},${margin.top-10})`)
            .text('Average Temperature vs. '+ capitalizeFirstLetter(currentCrop) + ' Yield in ' + currentYear.toString())
            .style("stroke", "#2a4d69")
            .style("text-anchor", "middle");

        graph = svg.append("g")
                    .attr('class', 'nodes');

        drawGraph();
    });
}

loadGraph(currentCrop);






