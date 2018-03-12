let people, performanceTotals, playSales, playTotals, plays

var nodes = [];
var links = [];

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
  playSales = psls.map( x => {
      x.date = new Date(x.date);
      return x
    })
    .sort( (a, b) => a.date.getTime() < b.date.getTime());

  playTotals = plttls;
  plays = pl;

  initStatistics();
  initNodesAndLinks();
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

function initNodesAndLinks() {
  var unique = playSales.reduce((prev, curr) => {
    if (!prev.plays.some(x => x.title === curr.title))
      prev.plays.push(curr);
    if (!prev.genres.some(x => x.genre === curr.genre))
      prev.genres.push(curr);
    if (!prev.authors.some(x => x.author === curr.author))
      prev.authors.push(curr);
    return prev;
  }, { plays: [], genres: [], authors: []});

  var genreNodes = unique.genres.map( (v, i, list) => ({ x: 0, y: i / list.length, modalFunc: getGenreModalFunction(v.genre), genre: v.genre}));
  var playNodes = unique.plays.map( (v, i, list) => ({ x: 1, y: i / list.length, modalFunc: getPlayModalFunction(v.title), author: v.author, genre: v.genre, play: v.title}));
  var authorNodes = unique.authors.map( (v, i, list) => ({ x: 2, y: i / list.length, modalFunc: getAuthorModalFunction(v.author), author: v.author}));

  nodes = playNodes.concat(authorNodes).concat(genreNodes);

  // Creating links between authors and plays as well as genres and plays
  playNodes.forEach( (play, idx) => {
    var authorNode = authorNodes.find( x => x.author === play.author);
    if (authorNode)
      links.push({ source: authorNode, target: play });

    var genreNode = genreNodes.find(x => x.genre === play.genre);
    if (genreNode)
      links.push({ source: play, target: genreNode });
  });

  // Creating links between authors and genres
  genreNodes.forEach( (genreNode, idx) => {
    links.push(
      ...unique.plays
      .filter( x => x.genre === genreNode.genre) // Get plays of this genre
      .filter( (p, i, a) => a.findIndex( x => x.author === p.author) === i) // The unique authors among these plays
      .map( play => ({ source: genreNode, target: authorNodes.find(x => x.author === play.author) })) // For each unique author - create link
    )
  });
}

function renderHivePlot() {
  d3.select("#graph > svg").remove();

  var innerRadius = 40;
  var width = window.innerWidth;
  var height = window.innerHeight - innerRadius * 2;
  var outerRadius = (height / 2);

  var angle = d3.scalePoint().domain(d3.range(4)).range([0, 2 * Math.PI]);
  var radius = d3.scaleLinear().range([innerRadius, outerRadius]);
  var color = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(20));
  
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
      .on("mouseout", mouseout)
      .on("click", function(d){showModal(d);});
}

function getAuthorModalFunction(author) {
  return function () {
    
  }
}

function getPlayModalFunction(play) {
  return function () {
    
  }
}

function getGenreModalFunction(genre) {
  return function () {
    
  }
}

function degrees(radians) {
  return radians / Math.PI * 180 - 90;
}

function showModal(d) {
  if (d.x == 0){
    // Modal for genre
    $('.modal-title').text("Genre: " + d.genre);  
  } else if (d.x == 1){
    // Modal for play
    $('.modal-title').text("Play: " + d.play);  
  } else {
    // Modal for author
    $('.modal-title').text("Author: " + d.author);  
  }
  
  $('.infomodal').modal('show');
}

// Highlight the link and connected nodes on mouseover.
function linkMouseover(d) {
  svg.selectAll(".link").classed("active", function(p) { return p === d; });
  svg.selectAll(".node").classed("active", function(p) { return p === d.source || p === d.target; });
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