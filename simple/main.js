let people, performanceTotals, playSales, playTotals, plays

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
      x.date = new Date(x);
      return x
    }).sort( (a, b) => a.date.getTime() < b.date.getTime()).slice(0, 10000);
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



/**
 * TODO:
 *  - Seperate data into authors, plays, and genre nodes
 *  - Add hover effect to links and nodes
 *  - Add on click function for modal
 */
function renderHivePlot() {
  var width = 960;
  var height = 500;
  var innerRadius = 40;
  var outerRadius = 240;

  var angle = d3.scalePoint().domain(d3.range(4)).range([0, 2 * Math.PI]);
  var radius = d3.scaleLinear().range([innerRadius, outerRadius]);
  var color = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(20));

  var plays = playSales.filter( (v, i, a) => a.findIndex( x => x.title === v.title) === i);
  var playNodes = plays.map( (v, i) => ({ x: 0, y: i / plays.length, modalFunc: getPlayModalFunction(v.title), author: v.author, genre: v.genre }));

  var genres = playSales.filter( (v, i, a) => a.findIndex(x => x.genre === v.genre) === i);
  var genreNodes = genres.map( (v, i) => ({ x: 1, y: i / genres.length, modalFunc: getGenreModalFunction(v.genre), genre: v.genre }));

  var authors = playSales.filter( (v, i, a) => a.findIndex(x => x.author === v.author) === i);
  var authorNodes = authors.map( (v, i) => ({ x: 2, y: i / authors.length, modalFunc: getAuthorModalFunction(v.author), author: v.author }));

  var nodes = playNodes.concat(authorNodes).concat(genreNodes);

  var links = [];
  
  // Link author to play
  // Link author to genre
  // Link genre to play
  playNodes.forEach( (play, idx) => {
    var authorNode = authorNodes.find( x => x.author === play.author);
    var authorPlayLink = { source: authorNode, target: play };

    var genreNode = genreNodes.find(x => x.genre === play.genre);
    var genrePlayLink = { source: play, target: genreNode };

    links.push(authorPlayLink, genrePlayLink);
  });

  genreNodes.forEach( (genreNode, idx) => {
    // Get set of authors who wrote genre
    // Get nodes of each author
    // Add link between each node and genreNode
    var authorsWhoWrote = plays
      .filter( x => x.genre === genreNode.genre)
      .filter( (p, i, a) => a.findIndex( x => x.author === p.author) === i)
      .forEach( play => {
        var authorNode = authorNodes.find( x => x.author === play.author);
        var link = { source: genreNode, target: authorNode };
        links.push(link);
      });
    
  });
  
  var svg = d3.select("#graph").append("svg")
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
      .style("stroke", function(d) { return color(d.source.x); });
  
  svg.selectAll(".node")
      .data(nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("transform", function(d) { return "rotate(" + degrees(angle(d.x)) + ")"; })
      .attr("cx", function(d) { return radius(d.y); })
      .attr("r", 5)
      .style("fill", function(d) { return color(d.x); });
}

function getAuthorModalFunction(author) {
  return function () {
    // Set up modal
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

function showModal() {
  $('.ui.basic.modal').modal('show');
}

