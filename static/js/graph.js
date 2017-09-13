queue()
    .defer(d3.json, "/donorsUS/projects")
    .await(makeGraphs);

function makeGraphs(error, donorsUSProjects) {
    if (error) {
        console.error("makeGraphs error on receiving dataset:", error.statusText);
        throw error;
    }


    //Create a Crossfilter instance
    var ndx = crossfilter(donorsUSProjects);

    //Define Dimensions
    var dateDim = ndx.dimension(function (d) {
        return d["SEASON"];
    });

    var dateDimChartMargins = {top: 30, right: 50, bottom: 25, left: 90};

    var fundingStatus = ndx.dimension(function (d) {
        return d["WINDOW"];
    });
    var stateDim = ndx.dimension(function (d) {
        return d["LEAGUE"];
    });
    var focusSubjectDim = ndx.dimension(function(d) {
        return d["PRICE DESCRIPTION"];
    });

    var povertyLevelDim = ndx.dimension(function (d) {
        return d["POSITION"];
    });

    var totalDonationsDim = ndx.dimension(function (d) {
        return d["TOTAL TRANSFERS"];
    });
    var all = ndx.groupAll();

    var yearDim = ndx.dimension (function (d) {
        return d["SEASON"];
    });


    //Calculate metrics
    var numProjectsByFundingStatus = fundingStatus.group();

    var stateGroup = stateDim.group();

    var totalTransfers = ndx.groupAll().reduceSum(function (d) {
        return d["PRICE"];
    });
    var numProjectsByFocusSubject =  focusSubjectDim.group();

    var numProjectsByPovertyLevel = povertyLevelDim.group();

    var total_year = yearDim.group();

    var valueDonationsByDate = dateDim.group().reduceSum(function (d) {
        return d["PRICE"];
    });

    var formatCommas = d3.format(",.0f");
    var formatDollarsCommas = d3.format("$,.0f");

    //Define values (to be used in charts)
    var minYear = yearDim.bottom(1)[0]["SEASON"];
    var maxYear = yearDim.top(1)[0]["SEASON"];

    //Charts
    var totalTransfersND = dc.numberDisplay("#total-transfers-nd");
    var transferWindowChart = dc.pieChart("#window-chart");
    var transferTypeChart = dc.pieChart("#transfer-type-chart");
    var playerPositionChart = dc.rowChart("#player-position-row-chart");
    var numberTransfersND = dc.numberDisplay("#number-transfers-nd");
    var numberTransfersPerSeasonChart = dc.lineChart('#year_appearance');
    var transferValueChart = dc.lineChart("#donation-value-line-chart");

    selectField = dc.selectMenu('#menu-select')
        .dimension(stateDim)
        .group(stateGroup);

    transferWindowChart
        .ordinalColors(["#79CED7", "#66AFB2", "#C96A23", "#D3D1C5", "#F5821F"])
        .height(220)
        .radius(90)
        .innerRadius(40)
        .transitionDuration(1500)
        .dimension(fundingStatus)
        .group(numProjectsByFundingStatus);

    totalTransfersND

        .valueAccessor(function (d) {
            return d;
        })
        .group(totalTransfers)
        .formatNumber(formatDollarsCommas)
        .height(150);


    transferTypeChart
        .height(220)
        .radius(90)
        .innerRadius(40)
        .transitionDuration(1500)
        .dimension(focusSubjectDim)
        .group(numProjectsByFocusSubject);

    playerPositionChart
        .width(300)
        .height(250)
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .xAxis().ticks(4);

    numberTransfersND

        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(all);

     numberTransfersPerSeasonChart
        .width(880)
        .height(300)
        .dimension(yearDim)
        .group(total_year)
        .x(d3.scale.ordinal().domain([(minYear),(maxYear)]))
        .xUnits(dc.units.ordinal)
        .elasticX(true)
        .brushOn(false)
        .renderArea(true)
        .yAxisLabel("Number of Transfers")
         .xAxisLabel("Season")
        .colors(["#003d76"]);

     transferValueChart
        .width(880)
        .height(300)
         .margins(dateDimChartMargins)
         .title(function (d) {
            return d.key + ": " + formatCommas(d.value);
        })
        .dimension(yearDim)
        .group(valueDonationsByDate, 'Total Transfer Fees (€)')
        .x(d3.scale.ordinal().domain([(minYear),(maxYear)]))
         .legend(dc.legend().x(120).y(20).itemHeight(13).gap(5))
        .xUnits(dc.units.ordinal)
         .mouseZoomable(false)
        .elasticX(true)
        .brushOn(false)
        .renderArea(true)
         .xAxisLabel("Season")
        .ordinalColors(['#41ab5d'])
     .elasticY(true)
        .renderHorizontalGridLines(true);



    dc.renderAll();
}