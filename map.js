var vaccineData = null;
var datesArray = [];
var dateIndex = -1;
var dateIndexMax = -1;
var stateShapes = null;
var slider = null;

var stateNames = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];


function loadData() {
    // read population data
    d3.csv("2019_Census_US_Population_Data_By_State_Lat_Long.csv", function (pop_data) {
        // read current vaccine data
        d3.csv('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/us_state_vaccinations.csv', function (vaccine_data) {
            // "New York" is written as "New York State", change to match
            vaccine_data.forEach(function(v){
                if(v.location == "New York State"){
                    v.location = "New York";
                }
            });
            vaccine_data = vaccine_data.filter(function(d){
                return stateNames.includes(d.location);
            });
            // merge current vaccine data with population data
            vaccine_data.forEach(function (vacc_temp) {
                var result = pop_data.filter(function (pop_temp) {
                    return pop_temp.STATE == vacc_temp.location;
                });
                // delete unneeded columns
                delete vacc_temp.total_vaccinations;
                delete vacc_temp.total_distributed;
                delete vacc_temp.people_fully_vaccinated_per_hundred;
                delete vacc_temp.total_vaccinations_per_hundred;
                // delete vacc_temp.people_fully_vaccinated;
                delete vacc_temp.people_vaccinated_per_hundred;
                delete vacc_temp.distributed_per_hundred;
                delete vacc_temp.daily_vaccinations_raw;
                delete vacc_temp.daily_vaccinations;
                delete vacc_temp.daily_vaccinations_per_million;
                delete vacc_temp.share_doses_used;

                vacc_temp.population = (result[0] !== undefined) ? result[0].POPESTIMATE2019 : null;

                // calculate percentage vaccinated
                vacc_temp.percentage_vaccinated = (result[0] !== undefined) ? (vacc_temp.people_vaccinated / result[0].POPESTIMATE2019) : null;
            });

            // ready to draw map
            vaccineData = vaccine_data;

            // get list of dates with associated data
            var date_temp = vaccine_data.filter(function (alabama_date) {
                return (alabama_date.location == "Alabama" && alabama_date.people_vaccinated != 0);
            });

            date_temp.forEach(function (d) {
                datesArray.push(d.date);
            });

            d3.select("#date").text(datesArray[datesArray.length - 1]);

            setDateIndex(datesArray.length - 1);
            setDateArrayMax(datesArray.length - 1);
            drawMap(datesArray[datesArray.length - 1]);
            totalUSNumbers(datesArray[datesArray.length - 1]);
        });
    });
    return true;
}

function setDateArrayMax(idx) {
    dateIndexMax = idx;
}

function getDateArrayMax() {
    return dateIndexMax;
}

function setDateIndex(idx) {
    dateIndex = idx;
}

function getDateIndex() {
    return dateIndex;
}

//Width and height of map
var width = 960;
var height = 600;

// D3 Projection
var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2]) // translate to center of screen
    .scale([1000]); // scale things down so see entire US

// Define path generator
var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
    .projection(projection); // tell path generator to use albersUsa projection

//Create SVG element and append map to the SVG
var svg1 = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var legendText = ["", "10%", "", "30%", "", "50%", "", "70%"];
var legendColors = ["#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];

// add a legend
var w = 300, h = 200;

var legend = svg1.append("g")
    .attr("width", w)
    .attr("height", h)
    .attr("id", "legend");

var legenditem = legend.selectAll(".legenditem")
    .data(d3.range(8))
    .enter()
    .append("g")
    .attr("class", "legenditem")
    .attr("transform", function (d, i) { return "translate(" + i * 31 + ",50)"; });

legenditem.append("rect")
    .attr("x", w + 300)
    // .attr("y", -7)
    .attr("width", 30)
    .attr("height", 6)
    .attr("transform", "translate(0,50)")
    .attr("class", "rect")
    .style("fill", function (d, i) { return legendColors[i]; });

legenditem.append("text")
    .attr("transform", "translate(0,50)")
    .attr("x", w + 300)
    .attr("y", 20)
    .style("text-anchor", "middle")
    .text(function (d, i) { return legendText[i]; });


var title = svg1.append("text")
    .style("text-anchor", "middle")
    .attr("transform", `translate(375, 75)`)
    .style("font-size", 18)
    .text("US COVID-19 Vaccination Status, 2021");

var loaded = loadData();

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDate(date){
    var d = date.split("-");
    var year = d[0];
    var monthIndex = parseInt(d[1]);
    var month = months[monthIndex - 1]
    var day = d[2];
    return month + " " + day + ", " + year;
}

function totalUSNumbers(date){
    data = vaccineData.filter(function (d) {
        return d.date == date;
    });

    var total_pop = 0;
    var total_vacc = 0;
    var total_fully_vacc = 0;

    // calculate overall US percentage
    // calculate overall US #ppl fully vaccinated

    data.forEach(function(d){

        if(!isNaN(parseFloat(d.population))){
            total_pop += parseFloat(d.population);
        }

        if(!isNaN(parseFloat(d.people_vaccinated))){
            total_vacc += parseFloat(d.people_vaccinated);
        }

        if(!isNaN(parseFloat(d.people_fully_vaccinated))){
            total_fully_vacc += parseFloat(d.people_fully_vaccinated);
        }
    });

    var total_percentage = (total_vacc/total_pop)*100;
    total_percentage = total_percentage.toFixed(1);

    d3.select("#percent").text(total_percentage);

    // format total_fully_vacc with commas, set
    d3.select("#people").text(numberWithCommas(total_fully_vacc));
}

function drawMap(date) {
    // Load in my states data!
    // only consider vaccine_data for rows with data matching given date
    data = vaccineData.filter(function (d) {
        return d.date == date;
    });

    let ramp = d3.scaleQuantize()
        .domain([0, 0.8])
        .range(["#f9fdcd", "#f9fdcb", "#f8fcca", "#f7fcc9", "#f7fcc8", "#f6fcc7", "#f6fbc6", "#f5fbc5", "#f4fbc4", "#f4fbc3", "#f3fac2", "#f2fac1", "#f1fac0", "#f1f9bf", "#f0f9be", "#eff9bd", "#eff9bc", "#eef8bb", "#edf8bb", "#ecf8ba", "#ebf7b9", "#eaf7b9", "#eaf7b8", "#e9f6b8", "#e8f6b7", "#e7f6b7", "#e6f5b6", "#e5f5b6", "#e4f4b5", "#e3f4b5", "#e2f4b5", "#e1f3b4", "#e0f3b4", "#dff2b4", "#ddf2b4", "#dcf1b4", "#dbf1b4", "#daf0b4", "#d9f0b3", "#d7efb3", "#d6efb3", "#d5eeb3", "#d3eeb3", "#d2edb3", "#d1edb4", "#cfecb4", "#ceecb4", "#ccebb4", "#cbebb4", "#c9eab4", "#c8e9b4", "#c6e9b4", "#c4e8b4", "#c3e7b5", "#c1e7b5", "#bfe6b5", "#bde5b5", "#bce5b5", "#bae4b5", "#b8e3b6", "#b6e2b6", "#b4e2b6", "#b2e1b6", "#b0e0b6", "#aedfb6", "#acdfb7", "#aadeb7", "#a8ddb7", "#a6dcb7", "#a4dbb7", "#a2dbb8", "#a0dab8", "#9ed9b8", "#9cd8b8", "#99d7b9", "#97d7b9", "#95d6b9", "#93d5b9", "#91d4b9", "#8fd3ba", "#8dd2ba", "#8ad2ba", "#88d1ba", "#86d0bb", "#84cfbb", "#82cebb", "#80cebb", "#7ecdbc", "#7cccbc", "#7acbbc", "#78cabc", "#76cabd", "#73c9bd", "#71c8bd", "#6fc7bd", "#6dc6be", "#6bc6be", "#6ac5be", "#68c4be", "#66c3bf", "#64c3bf", "#62c2bf", "#60c1bf", "#5ec0c0", "#5cbfc0", "#5abfc0", "#59bec0", "#57bdc0", "#55bcc1", "#53bbc1", "#52bac1", "#50bac1", "#4eb9c1", "#4db8c1", "#4bb7c1", "#49b6c2", "#48b5c2", "#46b4c2", "#45b3c2", "#43b2c2", "#42b1c2", "#40b0c2", "#3fafc2", "#3daec2", "#3cadc2", "#3bacc2", "#39abc2", "#38aac2", "#37a9c2", "#35a8c2", "#34a7c2", "#33a6c2", "#32a5c2", "#31a3c1", "#30a2c1", "#2fa1c1", "#2ea0c1", "#2d9fc1", "#2c9dc0", "#2b9cc0", "#2a9bc0", "#299ac0", "#2898bf", "#2897bf", "#2796bf", "#2695be", "#2693be", "#2592be", "#2591bd", "#248fbd", "#248ebc", "#238cbc", "#238bbb", "#228abb", "#2288ba", "#2287ba", "#2185b9", "#2184b9", "#2182b8", "#2181b8", "#217fb7", "#217eb6", "#207cb6", "#207bb5", "#2079b5", "#2078b4", "#2076b3", "#2075b3", "#2073b2", "#2072b1", "#2070b1", "#216fb0", "#216daf", "#216cae", "#216aae", "#2169ad", "#2167ac", "#2166ac", "#2164ab", "#2163aa", "#2261aa", "#2260a9", "#225ea8", "#225da7", "#225ca7", "#225aa6", "#2259a5", "#2257a5", "#2256a4", "#2354a3", "#2353a3", "#2352a2", "#2350a1", "#234fa0", "#234ea0", "#234c9f", "#234b9e", "#234a9d", "#23499d", "#23479c", "#23469b", "#23459a", "#224499", "#224298", "#224197", "#224096", "#223f95", "#223e94", "#213d93", "#213c92", "#213a91", "#203990", "#20388f", "#20378d", "#1f368c", "#1f358b", "#1e348a", "#1e3388", "#1d3287", "#1d3185", "#1c3184", "#1c3082", "#1b2f81", "#1a2e7f", "#1a2d7e", "#192c7c", "#182b7a", "#172b79", "#172a77", "#162975", "#152874", "#142772", "#132770", "#13266e", "#12256c", "#11246b", "#102469", "#0f2367", "#0e2265", "#0d2163", "#0d2161", "#0c2060", "#0b1f5e", "#0a1e5c", "#091e5a", "#081d58"]);

    // Load GeoJSON data and merge with states data
    d3.json("us-states.json", function (json) {

        // Loop through each state data value in the .csv file
        for (var i = 0; i < data.length; i++) {

            // Grab State Name
            var dataState = data[i].location;

            // Grab data value 
            var dataValue = data[i].percentage_vaccinated;
            var vaccValue = data[i].people_vaccinated;
            var popValue = data[i].population;

            // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j].properties.NAME;

                if (dataState == jsonState) {
                    // Copy the data value into the JSON
                    json.features[j].properties.percentage = dataValue;
                    json.features[j].properties.people_vacc = vaccValue;
                    json.features[j].properties.population = popValue;
                    // Stop looking through the JSON
                    break;
                }
            }
        }

        // Bind the data to the SVG and create one path per GeoJSON feature
        stateShapes = svg1.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("transform", "translate(0,50)")
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function (d) {
                if (d.properties.percentage == undefined || d.properties.percentage == null) {
                    return '#d3d3d3';
                }
                return ramp(d.properties.percentage)
            });


        stateShapes
            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(250)
                    .style("opacity", 1);
                tooltip.html(
                    "<p><strong>" + d.properties.NAME + "</strong></p>" +
                    "<table><tbody><tr><td class='wide'>Percentage Vaccinated:</td><td>" + "&nbsp;&nbsp;&nbsp;&nbsp;" + (d.properties.percentage * 100).toFixed(1) + "%" + "</td></tr>" + "<tr><td class='wide'>People Vaccinated:</td><td>" + numberWithCommas(Math.floor(d.properties.people_vacc)) + "</td></tr>" + "<tr><td class='wide'>State Population:</td><td>" + numberWithCommas(d.properties.population) + "</td></tr>" + "</tbody></table>"
                )
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(250)
                    .style("opacity", 0);
            });
    });
    subheader = svg1.append("text")
        .style("text-anchor", "middle")
        .attr("transform", `translate(450, 100)`)
        .attr("class", "date")
        .style("font-size", 15)
        .text("on " + formatDate(date));

    slider = d3.select(".slider")
        .append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", getDateArrayMax())
        .attr("value", getDateArrayMax())
        .on("input", function () {
            // var date = this.value;
            updateMap(datesArray[this.value]);
        });
}

function updateMap(date) {
    d3.select(".date").text("on " + formatDate(date));

    let ramp = d3.scaleQuantize()
        .domain([0, 0.8])
        .range(["#f9fdcd", "#f9fdcb", "#f8fcca", "#f7fcc9", "#f7fcc8", "#f6fcc7", "#f6fbc6", "#f5fbc5", "#f4fbc4", "#f4fbc3", "#f3fac2", "#f2fac1", "#f1fac0", "#f1f9bf", "#f0f9be", "#eff9bd", "#eff9bc", "#eef8bb", "#edf8bb", "#ecf8ba", "#ebf7b9", "#eaf7b9", "#eaf7b8", "#e9f6b8", "#e8f6b7", "#e7f6b7", "#e6f5b6", "#e5f5b6", "#e4f4b5", "#e3f4b5", "#e2f4b5", "#e1f3b4", "#e0f3b4", "#dff2b4", "#ddf2b4", "#dcf1b4", "#dbf1b4", "#daf0b4", "#d9f0b3", "#d7efb3", "#d6efb3", "#d5eeb3", "#d3eeb3", "#d2edb3", "#d1edb4", "#cfecb4", "#ceecb4", "#ccebb4", "#cbebb4", "#c9eab4", "#c8e9b4", "#c6e9b4", "#c4e8b4", "#c3e7b5", "#c1e7b5", "#bfe6b5", "#bde5b5", "#bce5b5", "#bae4b5", "#b8e3b6", "#b6e2b6", "#b4e2b6", "#b2e1b6", "#b0e0b6", "#aedfb6", "#acdfb7", "#aadeb7", "#a8ddb7", "#a6dcb7", "#a4dbb7", "#a2dbb8", "#a0dab8", "#9ed9b8", "#9cd8b8", "#99d7b9", "#97d7b9", "#95d6b9", "#93d5b9", "#91d4b9", "#8fd3ba", "#8dd2ba", "#8ad2ba", "#88d1ba", "#86d0bb", "#84cfbb", "#82cebb", "#80cebb", "#7ecdbc", "#7cccbc", "#7acbbc", "#78cabc", "#76cabd", "#73c9bd", "#71c8bd", "#6fc7bd", "#6dc6be", "#6bc6be", "#6ac5be", "#68c4be", "#66c3bf", "#64c3bf", "#62c2bf", "#60c1bf", "#5ec0c0", "#5cbfc0", "#5abfc0", "#59bec0", "#57bdc0", "#55bcc1", "#53bbc1", "#52bac1", "#50bac1", "#4eb9c1", "#4db8c1", "#4bb7c1", "#49b6c2", "#48b5c2", "#46b4c2", "#45b3c2", "#43b2c2", "#42b1c2", "#40b0c2", "#3fafc2", "#3daec2", "#3cadc2", "#3bacc2", "#39abc2", "#38aac2", "#37a9c2", "#35a8c2", "#34a7c2", "#33a6c2", "#32a5c2", "#31a3c1", "#30a2c1", "#2fa1c1", "#2ea0c1", "#2d9fc1", "#2c9dc0", "#2b9cc0", "#2a9bc0", "#299ac0", "#2898bf", "#2897bf", "#2796bf", "#2695be", "#2693be", "#2592be", "#2591bd", "#248fbd", "#248ebc", "#238cbc", "#238bbb", "#228abb", "#2288ba", "#2287ba", "#2185b9", "#2184b9", "#2182b8", "#2181b8", "#217fb7", "#217eb6", "#207cb6", "#207bb5", "#2079b5", "#2078b4", "#2076b3", "#2075b3", "#2073b2", "#2072b1", "#2070b1", "#216fb0", "#216daf", "#216cae", "#216aae", "#2169ad", "#2167ac", "#2166ac", "#2164ab", "#2163aa", "#2261aa", "#2260a9", "#225ea8", "#225da7", "#225ca7", "#225aa6", "#2259a5", "#2257a5", "#2256a4", "#2354a3", "#2353a3", "#2352a2", "#2350a1", "#234fa0", "#234ea0", "#234c9f", "#234b9e", "#234a9d", "#23499d", "#23479c", "#23469b", "#23459a", "#224499", "#224298", "#224197", "#224096", "#223f95", "#223e94", "#213d93", "#213c92", "#213a91", "#203990", "#20388f", "#20378d", "#1f368c", "#1f358b", "#1e348a", "#1e3388", "#1d3287", "#1d3185", "#1c3184", "#1c3082", "#1b2f81", "#1a2e7f", "#1a2d7e", "#192c7c", "#182b7a", "#172b79", "#172a77", "#162975", "#152874", "#142772", "#132770", "#13266e", "#12256c", "#11246b", "#102469", "#0f2367", "#0e2265", "#0d2163", "#0d2161", "#0c2060", "#0b1f5e", "#0a1e5c", "#091e5a", "#081d58"]);

    data = vaccineData.filter(function (d) {
        return d.date == date;
    });

    d3.json("us-states.json", function (json) {

        // Loop through each state data value in the .csv file
        for (var i = 0; i < data.length; i++) {

            // Grab State Name
            var dataState = data[i].location;

            // Grab data value 
            var dataValue = data[i].percentage_vaccinated;
            var vaccValue = data[i].people_vaccinated;
            var popValue = data[i].population;

            // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j].properties.NAME;

                if (dataState == jsonState) {
                    // Copy the data value into the JSON
                    json.features[j].properties.percentage = dataValue;
                    json.features[j].properties.people_vacc = vaccValue;
                    json.features[j].properties.population = popValue;
                    // Stop looking through the JSON
                    break;
                }
            }
        }

        stateShapes
            .data(json.features)
            .style("fill", function (d) {
                if (d.properties.percentage == undefined || d.properties.percentage == null) {
                    return '#d3d3d3';
                }
                return ramp(d.properties.percentage);
            });

        stateShapes
            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(250)
                    .style("opacity", 1);
                tooltip.html(
                    "<p><strong>" + d.properties.NAME + "</strong></p>" +
                    "<table><tbody><tr><td class='wide'>Percentage Vaccinated:</td><td>" + "&nbsp;&nbsp;&nbsp;&nbsp;" + (d.properties.percentage * 100).toFixed(1) + "%" + "</td></tr>" + "<tr><td class='wide'>People Vaccinated:</td><td>" + numberWithCommas(Math.floor(d.properties.people_vacc)) + "</td></tr>" + "<tr><td class='wide'>State Population:</td><td>" + numberWithCommas(d.properties.population) + "</td></tr>" + "</tbody></table>"
                )
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(250)
                    .style("opacity", 0);
            });
    });



}