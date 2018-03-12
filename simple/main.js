
let people, performanceTotals, playSales, playTotals, plays

var svg;

d3.queue()
  .defer(d3.json, 'data/people.json')
  .defer(d3.json, 'data/performance_with_totals.json')
  .defer(d3.json, 'data/play_ticket_sales.json')
  .defer(d3.json, 'data/plays_with_totals.json')
  .defer(d3.json, 'data/plays.json')
  .await(loadHandler);

function loadHandler(err, ppl, pttls, psls, plttls, pl) {
  if (err) 
    return console.log('Failed to load data!!!');

  people = ppl;
  performanceTotals = pttls;
  playSales = psls;
  playTotals = plttls;
  plays = pl;

  initStatistics();
  renderHivePlot();
  $('.loader').toggleClass(['active', 'disabled']);
}

function initStatistics() {
  const labels = ['People', 'Plays', 'Sales Records', 'Performances with Totals', 'Plays with Totals'];
  const newStats = [people, plays, playSales, performanceTotals, playTotals].map((x, i) => {
    const valDiv = $('<div></div>').addClass('value').text(x.length);
    const labelDiv = $('<div></div>').addClass('label').text(labels[i]);
    return $('<div></div>').addClass('statistic').append(valDiv, labelDiv);
  });
  $('.statistics').append(newStats)
}

function renderHivePlot() {
  var width = 960;
  var height = 500;
  var innerRadius = 40;
  var outerRadius = 240;

  var angle = d3.scalePoint().domain(d3.range(4)).range([0, 2 * Math.PI]);
  var radius = d3.scaleLinear().range([innerRadius, outerRadius]);
  var color = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(20));

  var nodes = [
    {x: 0, y: .1},
    {x: 0, y: .9},
    {x: 1, y: .2},
    {x: 1, y: .3},
    {x: 2, y: .1},
    {x: 2, y: .8}
  ];
  
  var links = [
    {source: nodes[0], target: nodes[2]},
    {source: nodes[1], target: nodes[3]},
    {source: nodes[2], target: nodes[4]},
    {source: nodes[2], target: nodes[5]},
    {source: nodes[3], target: nodes[5]},
    {source: nodes[4], target: nodes[0]},
    {source: nodes[5], target: nodes[1]}
  ];
  
  svg = d3.select("#graph").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  
  svg.selectAll(".axis")
      .data(d3.range(3))
    .enter().append("line")
      .attr("class", "axis")
      .attr("transform", function(d) { return "rotate(" + degrees(angle(d)) + ")"; })
      .attr("x1", radius.range()[0])
      .attr("x2", radius.range()[1]);
  
  svg.selectAll(".link")
      .data(links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.hive.link()
      .angle(function(d) { return angle(d.x); })
      .radius(function(d) { return radius(d.y); }))
      .on("mouseover", linkMouseover)
      .on("mouseout", mouseout);
  
  svg.selectAll(".node")
      .data(nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("transform", function(d) { return "rotate(" + degrees(angle(d.x)) + ")"; })
      .attr("cx", function(d) { return radius(d.y); })
      .attr("r", 5)
      .style("fill", function(d) { return color(d.x); })
      .on("mouseover", nodeMouseover)
      .on("mouseout", mouseout);
}

function degrees(radians) {
  return radians / Math.PI * 180 - 90;
}

function showModal() {
  $('.ui.basic.modal').modal('show');
}

// Highlight the link and connected nodes on mouseover.
function linkMouseover(d) {
  svg.selectAll(".link").classed("active", function(p) { return p === d; });
  svg.selectAll(".node circle").classed("active", function(p) { return p === d.source || p === d.target; });
}

// Highlight the node and connected links on mouseover.
function nodeMouseover(d) {
  svg.selectAll(".link").classed("active", function(p) { return p.source === d || p.target === d; });
  d3.select(this).classed("active", true);
}

// Clear any highlighted nodes or links.
function mouseout() {
  svg.selectAll(".active").classed("active", false);
}