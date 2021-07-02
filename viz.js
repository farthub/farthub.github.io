width = 550;
height = 400;

const margin = {top: 45, right: 10, bottom: 40, left: 10};

var x;
var y;
let color = d3.scaleOrdinal(d3.schemePastel2);

var circles;

let tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var t = d3.transition()
    .duration(1000)
    .ease(d3.easeLinear);

function drawGraph(){
    year_data = getYieldTemp(currentYear);
    console.log(currentYear);
    console.log(year_data);
    circles = graph.selectAll("circle")
                        .data(year_data)
                        .enter()
                        .append("circle")
                        .on("mouseover", mouseover)
                        .on("mouseout", mouseout)
                        .attr('r', d => {return (d.temp*d.yield)/10 + 5;})
                        .attr('cx', d => {return x(d.temp);})
                        .attr('cy', d => {return y(d.yield);})
                        .attr('fill', d => {return color(d.state)})
                        .attr('stroke-width', 1)
                        .attr('stroke', '#666666');
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateGraph(){
    year_data = getYieldTemp(currentYear);
    graph = d3.select(".nodes");
    circles = graph.selectAll("circle");
    circles.data(year_data);
    circles.transition(t)
            .attr('cx', d => {return x(d.temp);})
            .attr('cy', d => {return y(d.yield);})
            .attr('r', d => {return (d.temp*d.yield)/10 + 5;})
            .duration(2000);
    title.text('Average Temperature vs. ' + capitalizeFirstLetter(currentCrop) + ' Yield in ' + currentYear.toString());
}

function setYear(year){
    currentYear = year;
}

function getYieldTemp(year){
    year = year.toString();
    return data.map((d)=>({
        state: d['state'], 
        yield: d['yield_'+ year], 
        temp: d["average_temp_" + year]
    }));
}


