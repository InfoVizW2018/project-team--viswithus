let people, performanceTotals, playSales, playTotals, plays, unique, statistics

var nodes = [];
var links = [];

var svg;

d3.queue()
  // .defer(d3.json, 'data/people.json')
  .defer(d3.json, 'data/performance_with_totals.json')
  // .defer(d3.json, 'data/play_ticket_sales.json')
  .defer(d3.json, 'data/plays_with_totals.json')
  .defer(d3.json, 'data/plays.json')
  .defer(d3.json, 'data/unique_data.json')
  .defer(d3.json, 'data/statistics.json')
  .await(loadHandler);

function loadHandler(err, ...data) {
  if (err) 
    return console.log('Failed to load data!!!');

  let i = 0;

  // people = data[i++];

  performanceTotals = data[i++];
  performanceTotals.forEach( x => x.date = new Date(x.date));

  // playSales = data[i++];
  // playSales.forEach( x => x.date = new Date(x.date));

  playTotals = data[i++];

  plays = data[i++];
  plays.forEach( x => x.dates = x.dates
      .map( d => new Date(d))
      .sort( (a, b) => a.getTime() - b.getTime()));

  unique = data[i++];

  statistics = data[i++];

  initStatistics();
  initNodesAndLinks();
  renderHivePlot();

  $('.loader').toggleClass(['active', 'disabled']);
}

function initStatistics() {
  const newStats = Object.keys(statistics).map( key => {
    const valDiv = $('<div></div>').addClass('value').text(statistics[key].number);
    const labelDiv = $('<div></div>').addClass('label').text(statistics[key].label);
    return $('<div></div>').addClass('statistic').append(valDiv, labelDiv);
  });
  $('.statistics').append(newStats)
}

function initNodesAndLinks() {
  var genreNodes = unique.genres.map( (genre, i, list) => ({ x: 0, y: 0, modalFunc: getGenreModalFunction(genre), genre: genre, linked: 0}));
  var authorNodes = unique.authors.map( (author, i, list) => ({ x: 2, y: 0, modalFunc: getAuthorModalFunction(author), author: author, linked: 0}));
  var playNodes = plays.filter(x => x.dates.length).map( (play, i, list) => {
    play.x = 1
    play.y = 0;
    play.modalFunc = getPlayModalFunction(play);
    play.linked = 0;
    return play;
  });

  // Creating links between authors and plays as well as genres and plays
  playNodes.forEach( (play, idx) => {
    if (play.author.length) {
      var i = authorNodes.findIndex( x => x.author === play.author);
      if (i > -1) {
        authorNodes[i].linked++;
        play.linked++;
        links.push({ source: authorNodes[i], target: play });
      }
    }
    if (play.genre.length > 1) {
      var i = genreNodes.findIndex(x => x.genre === play.genre);
      if (i > -1) {
        genreNodes[i].linked++;
        play.linked++;
        links.push({ source: play, target: genreNodes[i] });
      }
    }
  });

  // Creating links between authors and genres
  genreNodes.forEach( (genreNode, idx) => {
    var authorGenreLinks = playNodes
      .filter( x => x.genre === genreNode.genre) // Get plays of this genre
      .filter( (p, i, a) => p.author.length && a.findIndex( x => x.author === p.author) === i) // The unique authors among these plays
      .map( play => {
        var i = authorNodes.findIndex(x => x.author === play.author)
        authorNodes[i].linked++;
        return { source: genreNode, target: authorNodes[i]}
      }); // For each unique author - create link
    genreNode.linked += authorGenreLinks.length;
    links = links.concat(authorGenreLinks);
  });

  const sortByLinks = (a, b) => a.linked - b.linked;
  const sortByDate = (a, b) => a.dates[0].getTime() - b.dates[0].getTime();

  const relativeToSize = (val, i, list) => {
    val.y = i / list.length;
    return val;
  }

  const relativeToTime = (list) => {
    const range = list.reduce((pre, curr) => {
        const millis = curr.dates[0].getTime();
        return { min: Math.min(millis, pre.min), max: Math.max(millis, pre.max)};
      }, { min: Infinity, max: -Infinity});

    return (val, i, list) => {
      val.y = (val.dates[0].getTime() - range.min) / (range.max - range.min);
      return val;
    }
  }
  
  playNodes = playNodes.sort(sortByDate).map(relativeToTime(playNodes));
  genreNodes = genreNodes.sort(sortByLinks).map(relativeToSize);
  authorNodes = authorNodes.sort(sortByLinks).map(relativeToSize);
  nodes = genreNodes.concat(authorNodes).concat(playNodes);
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
      .on("click", function(d) { d.modalFunc(); });
}

function getAuthorModalFunction(author) {
  return function () {
    $('.modal-title').text("Author: " + author);  
    $('#infomodal').modal('show');
  }
}

function getPlayModalFunction(title, date) {
  return function () {
    const play = playSales.find( x => x.title === title);
    $('.modal-title').text("Play: " + play.title);  
    $('.modal-content').text("Date: " + date.toString());
    $('#infomodal').modal('show');
  }
}

function getGenreModalFunction(genre) {
  return function () {
    $('.modal-title').text("Genre: " + genre);
    $('#infomodal').modal('show');
  }
}

function degrees(radians) {
  return radians / Math.PI * 180 - 90;
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