let people, performanceTotals, playSales, playTotals, plays, unique, statistics

var nodes = [];
var links = [];

var currentRange = { min: Infinity, max: -Infinity };

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
  plays.forEach( x => x.dates.forEach( d => d.time = new Date(d.time)));

  unique = data[i++];

  statistics = data[i++];

  initDropDown();
  initStatistics();
  renderHivePlot();

  $('.loader').toggleClass(['active', 'disabled']);
}

function initDropDown() {
  const dateRange = plays
    .filter( x => x.dates.length)
    .reduce( (prev, curr) => {
      const year0 = curr.dates[0].time.getFullYear();
      const year1 = curr.dates[curr.dates.length - 1].time.getFullYear() + 1;
      return { min: Math.min(prev.min, year0), max: Math.max(prev.max, year1) };
    }, { min: Infinity, max: -Infinity });

  currentRange.min = dateRange.min;
  currentRange.max = dateRange.min + 1;

  const options1 = [];
  const options2 = [];
  for (let i = dateRange.min; i <= dateRange.max; i++) {
    const htmlstr = `<option value="${i}">${i}</option>`;
    options1.push($(htmlstr));
    options2.push($(htmlstr));
  }
  options1.pop();

  $('#minDate')
    .append(options1)
    .change( function () {
      $(this).removeClass('error');
      const year = $(this).val();
      if (year === currentRange.min) return;

      if (year >= currentRange.max) {
        $(this).val(currentRange.min)
        return $(this).addClass('error');
      } else {
        $('#maxDate').removeClass('error');
        currentRange.min = year;
        renderHivePlot();
      }
    });

  $('#maxDate')
    .append(options2)
    .val(currentRange.max)
    .change( function () {
      $(this).removeClass('error');
      const year = $(this).val();
      if (year === currentRange.max) return;

      if (year <= currentRange.min) {
        $(this).val(currentRange.max)
        return $(this).addClass('error');
      } else {
        $('#minDate').removeClass('error');
        currentRange.max = year;
        renderHivePlot();
      }
    });

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
  var playNodes = plays
  .filter(x => {
    if (!x.dates.length) return false;
    const year = x.dates[0].time.getFullYear();
    return year >= currentRange.min && year < currentRange.max;
  }).map( (play, i, list) => {
    play.x = 1
    play.y = 0;
    play.modalFunc = getPlayModalFunction(play);
    play.popupFunc = getPlayPopupFunction(play);
    play.linked = 0;
    return play;
  });

  var genreNodes = unique.genres.map( (genre, i, list) =>
    ({ x: 0, y: 0, modalFunc: getGenreModalFunction(genre), popupFunc: getGenrePopupFunction(genre), genre: genre, linked: 0}));

  var authorNodes = unique.authors
    .filter( x => playNodes.some( play => play.author === x))
    .map( (author, i, list) =>
    ({ x: 2, y: 0, modalFunc: getAuthorModalFunction(author), popupFunc: getAuthorPopupFunction(author), author: author, linked: 0}));


  links = [];
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
        links.push({ source: genreNodes[i], target: play });
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
  const sortByDate = (a, b) => a.dates[0].time.getTime() - b.dates[0].time.getTime();

  const relativeToSize = (val, i, list) => {
    val.y = i / list.length;
    return val;
  }

  const relativeToTime = (list) => {
    const range = { min: new Date(currentRange.min, 0, 1), max: new Date(currentRange.max, 0, 1) };
    return (val, i, list) => {
      val.y = (val.dates[0].time.getTime() - range.min) / (range.max - range.min);
      return val;
    }
  }

  playNodes = playNodes.sort(sortByDate).map(relativeToTime(playNodes));
  genreNodes = genreNodes.sort(sortByLinks).map(relativeToSize);
  authorNodes = authorNodes.sort(sortByLinks).map(relativeToSize);
  nodes = genreNodes.concat(authorNodes).concat(playNodes);
}

function renderHivePlot() {
  initNodesAndLinks();

  var innerRadius = 40;
  var width = window.innerWidth;
  var height = window.innerHeight - innerRadius * 2;
  var outerRadius = (height / 2);

  var angle = d3.scalePoint().domain(d3.range(4)).range([0, 2 * Math.PI]);
  var radius = d3.scaleLinear().range([innerRadius, outerRadius]);
  var color = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(20));

  d3.select("#hive-plot").selectAll("*").remove();

  svg = d3.select("#hive-plot")
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
    $('#authorName').text(author);
    $('#authormodal').modal('show');

    renderAuthorPopularityRank(author);
    renderAuthorPlaySuccessBarChart(author);
    renderAuthorGenreDistDonutChart(author);
  }
}

function getAuthorPopupFunction(author) {
  return function() {
    const title = $(`<div class="ui green label">Author: ${author}</div>`);
    $('#infoPopup').append(title);
  }
}

function getPlayModalFunction(play) {
  return function () {
    $('.modal-title').text("Play: " + play.title);
    $('#playmodal').modal('show');

    renderPlayRankInGenre(play);
    renderPlayRankByAuthor(play);
    renderRecitalDistribution(play);
  }
}

function getPlayPopupFunction(play) {
  return function () {
    const title = $(`<div class="ui orange label">Play: ${play.title}</div>`);
    const date = $(`<div class="ui black label">${play.dates[0].time.toLocaleDateString()}</div>`);
    $('#infoPopup').append(title, date);
  }
}

function getGenreModalFunction(genre) {
  const playsGenre = plays.filter( p => p.genre === genre);

  const top5elems = playsGenre
    .sort( (a, b) => b.total_sold - a.total_sold )
    .slice(0, 5)
    .map( play => {
      const header = $('<div></div>').addClass('header').text(play.title)
      const meta = $('<div></div>').addClass('meta').append(
        $('<span></span>').addClass(['right', 'floated']).text(`${play.total_sold} sold`),
        $('<span></span>').addClass('category').text(play.author)
      )
      return $('<li></li>').addClass('item').append(header, meta);
    });

  const top5auths =  unique.authors
    .map( author => {
      const authorsPlays = playsGenre.filter( p => p.author === author )
      return {
        name: author,
        count: authorsPlays.length,
        sold: authorsPlays.reduce( (prev, curr) => prev + curr.total_sold, 0)
      }
    })
    .sort( (a, b) => b.sold === a.sold ? b.count - a.count : b.sold - a.sold)
    .slice(0, 5)
    .filter( x => x.count > 0)
    .map( x => {
      const header = $('<div></div>').addClass('header').text(x.name)
      const meta = $('<div></div>').addClass('meta').append(
        $('<span></span>').addClass(['right', 'floated']).text(`${x.count} plays`),
        $('<span></span>').addClass('category').text(`${x.sold} sold`)
      )
      return $('<li></li>').addClass('item').append(header, meta);
    });

  return function () {
    $('#genreName').text(genre);

    $('#top5plays').empty().append(top5elems);
    $('#top5authors').empty().append(top5auths);

    renderGenrePieChart(genre);

    $('#genremodal').modal('show');
  }
}

function getGenrePopupFunction(genre) {
  return function () {
    const title = $(`<div class="ui blue label">Genre: ${genre}</div>`);
    $('#infoPopup').append(title);
  }
}

function degrees(radians) {
  return radians / Math.PI * 180 - 90;
}

// Highlight the link and connected nodes on mouseover.
function linkMouseover(d) {
  svg.selectAll(".link").classed("active", function(p) { return p === d; });
  svg.selectAll(".node").classed("active", function(p) { return p === d.source || p === d.target; });
  d.source.popupFunc();
  d.target.popupFunc();
}

// Highlight the node and connected links on mouseover.
function nodeMouseover(d) {
  svg.selectAll(".link").classed("active", function(p) { return p.source === d || p.target === d; });
  d3.select(this).classed("active", true);
  d.popupFunc();
}

// Clear any highlighted nodes or links.
function mouseout() {
  svg.selectAll(".active").classed("active", false);
  $('#infoPopup').children().remove();
}

function renderAuthorGenreDistDonutChart(author){
  var playsByCurrAuthor = plays.filter( function (play) {
    return play.author == author;
  });

  var numPlays = playsByCurrAuthor.length;

  var genresList = [];

  playsByCurrAuthor.forEach(function(play){
    genresList.push(play.genre);
  });

  const counts = genresList.reduce( (tally, genre) => {
    tally[genre] = (tally[genre] || 0) + 1 ;
    return tally;
  } , {});

  var seedData = [];
  var len = counts.length;

  for (var genre in counts)
      seedData.push({ "genre": genre, "value": counts[genre]});

  // Define size & radius of donut pie chart
  var width = 450,
      height = 450,
      radius = Math.min(width, height) / 2;

  // Define arc colours
  var colour = d3.scaleOrdinal(d3.schemeCategory10);

  // Define arc ranges
  var arcText = d3.scaleOrdinal()
    .range([0, width]);

  // Determine size of arcs
  var arc = d3.arc()
    .innerRadius(radius - 130)
    .outerRadius(radius - 10);

  // Create the donut pie chart layout
  var pie = d3.pie()
    .value(function (d) { return d["value"]; })
    .sort(null);

  d3.select("#author-donut-chart").selectAll("*").remove();

  // Append SVG attributes and append g to the SVG
  var svg = d3.select("#author-donut-chart")
    .attr("width", width)
    .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + radius + "," + radius + ")");

  // Define inner circle
  svg.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 100)
    .attr("fill", "#fff") ;

  // Calculate SVG paths and fill in the colours
  var g = svg.selectAll(".arc")
    .data(pie(seedData))
    .enter().append("g")
    .attr("class", "arc")

    // Make each arc clickable
    // .on("click", function(d, i) {
    //   window.location = seedData[i].link;
    // });

  // Append the path to each g
  g.append("path")
    .attr("d", arc)
    .attr("fill", function(d, i) {
      return colour(i);
    });

  // Append text labels to each arc
  g.append("text")
    .attr("transform", function(d) {
      return "translate(" + arc.centroid(d) + ")";
    })
    .attr("dy", ".35em")
    .style("text-anchor", "middle")
    .attr("fill", "#fff")
    .attr("background-color", "#000")
    .text(function(d,i) { return seedData[i].genre; })

  g.selectAll(".arc text").call(wrap, arcText.range([0, width]));

  // Append text to the inner circle
  svg.append("text")
    .attr("dy", "-0.5em")
    .style("text-anchor", "middle")
    .attr("class", "inner-circle")
    .attr("fill", "#36454f")
    .text(function(d) { return 'Plays Written'; });

  svg.append("text")
    .attr("dy", "1.0em")
    .attr("size", "12")
    .style("text-anchor", "middle")
    .attr("class", "inner-circle donut-label")
    .attr("fill", "#36454f")
    .text(function(d) { return numPlays; });

}

function renderAuthorPlaySuccessBarChart(author){
  var playsByCurrAuthor = plays.filter( function (play) {
    return play.author == author;
  });

  playsByCurrAuthor.sort(function (a,b){
    return b.total_sold - a.total_sold;
  });

  var topFivePlays = playsByCurrAuthor.slice(0,5);

  topFivePlays.forEach(function(play){
    play.title = truncate(play.title);
  });

  var margin = {top: 20, right: 30, bottom: 200, left:50},
    width = 450 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

    var x = d3.scaleBand()
      .rangeRound([0, width])
      .padding(0.6);

    var y = d3.scaleLinear()
      .range([height, 0]);

    $("#author-bar-chart").empty();
    var svg = d3.select("#author-bar-chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(topFivePlays.map(function(d) { return d.title; }));
    y.domain([0, d3.max(topFivePlays, function(d) { return d.total_sold; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom().scale(x))
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"
                });


    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft().scale(y));

    svg.selectAll(".bar")
    .data(topFivePlays)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.title); })
        .attr("width", 40)
        .attr("y", function(d) { return y(d.total_sold); })
        .attr("height", function(d) { return height - y(d.total_sold); });
}

function truncate(string){
   if (string.length > 40)
      return string.substring(0,40)+'...';
   else
      return string;
};

function renderAuthorPopularityRank(author){
  var authorPlays = [];

  for (var aut in unique.authors)
      authorPlays.push({ "name": unique.authors[aut], "total_sold": 0});
  // console.log(authorPlays[0].fullname);
  authorPlays.forEach(function(a){
    var currIndex = authorPlays.indexOf(a);
    var currAuthorPlayCount = 0;
      plays.forEach(function(p){
        if (p.author != null){
          if (p.author.includes(a.name)){
            currAuthorPlayCount = currAuthorPlayCount + p.total_sold;
          }
        }
      });

      authorPlays[currIndex] = {"name": a.name, "total_sold": currAuthorPlayCount};
  });

  authorPlays.sort(function (a,b){
    return b.total_sold - a.total_sold;
  });

  var rank = authorPlays.findIndex(auth => auth.name == author) + 1;

  $("#author-rank").text(rank);
}

// Wrap function to handle labels with longer text
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > 90) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

function renderGenrePieChart(genre) {
  const genrePlays = plays.filter( x => x.genre );

  const count = genrePlays.filter( x => x.genre === genre).length;
  const data = [
    { x: 0, label: genre, count: count },
    { x: 1, label: 'Other genres', count: genrePlays.length - count }
  ]

  const width = 500;
  const height = 500;

  const radius = Math.min(width, height) / 2;

  d3.select("#pieChart").selectAll("*").remove();

  const svg = d3.select('#pieChart')
    .attr('width', width)
    .attr('height', height)

  const g = svg
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

  const color = d3.scaleOrdinal([ '#c11900', 'grey']);

  const pie = d3.pie()
    .sort(null)
    .value( function (d) { return d.count; });

  const path = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

  const label = d3.arc()
    .outerRadius(radius - width / 2)
    .innerRadius(radius - 40);

  const arc = g.selectAll('.arc')
      .data(pie(data))
    .enter()
      .append('g')
      .attr('class', 'arc');

  arc.append('path')
    .attr('d', path)
    .attr('fill', function (d) { return color(d.data.x); });

  // arc.append('text')
  //   .attr('transform', function (d) { return `translate(${label.centroid(d)})`; })
  //   .attr('dy', '0.35em')
  //   .text(function (d) { return d.data.label; });
}

function renderPlayRankInGenre(play) {
  const sortBySales = (a,b) => b.total_sold - a.total_sold;
  const playsOfSameGenre = plays.filter(x=> x.genre == play.genre).map(y=> y.title);
  const rank = playTotals.filter(x => playsOfSameGenre.indexOf(x.title) >= 0).sort(sortBySales).map(x=>x.title).indexOf(play.title) +1;
  const meta = $('<div></div>').addClass('meta').append(
    $('<span></span>').text(`Among works of the same genre (${play.genre})`));
  const toAdd= $('<span></span>').addClass('green').text(rank);
  $('#playRankGenre').empty().append(meta, toAdd);
}

function renderPlayRankByAuthor(play) {
  const sortBySales = (a,b) => b.total_sold - a.total_sold;
  const playsBySameAuthor = plays.filter(x=>x.author==play.author).map(y=> y.title);
  const rank = playTotals.filter(x => playsBySameAuthor.indexOf(x.title) >=0).sort(sortBySales).map(x=>x.title).indexOf(play.title) +1;;
  const meta = $('<div></div>').addClass('meta').append(
    $('<span></span>').text(`Among works also by ${play.author}`));
  const toAdd= $('<span></span>').addClass('green').text(rank);
  $('#playRankAuthor').empty().append(meta, toAdd);
}

function renderRecitalDistribution(play) {
  const days= play.dates.map(function(x) {
    var obj={};
    obj['day'] = x.time.getDay();
    obj['sales']= x.total;
    return obj;
  });

  var groups = days.reduce((h, a) => Object.assign(h, { [a.day]:( h[a.day] || [] ).concat(a.sales) }), {});
  const dayString = function(x){return ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][x];}
  var cons=[]
  Object.keys(groups).forEach(function(x) {
    cons.push([dayString(x),(groups[x].reduce((a,b)=> a+b,0))]);
  });
  const total = cons.map(x=>x[1]).reduce((a,b)=> a+b,0);
  var data =[]
  for(var i=0;i<cons.length;i++) {
    data.push({x:i, label:cons[i][0], value: (cons[i][1]/total)*100});
  }

  const width = 500;
  const height = 500;

  const radius = Math.min(width, height) / 2;

  d3.select("#playPieChart").selectAll("*").remove();

  const svg = d3.select('#playPieChart')
    .attr('width', width)
    .attr('height', height)

  const g = svg
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const pie = d3.pie()
    .sort(null)
    .value( function (d) { return d.value; });

    const path = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    const label = d3.arc()
      .outerRadius(radius - width / 2)
      .innerRadius(radius - 40);

    const arc = g.selectAll('.arc')
        .data(pie(data))
      .enter()
        .append('g')
        .attr('class', 'arc');

    arc.append('path')
      .attr('d', path)
      .attr('fill', function (d) { return color(d.data.x); });

    arc.append('text')
      .attr('transform', function (d) { return `translate(${label.centroid(d)})`; })
      .attr('dy', '0.35em')
      .text(function (d) { return d.data.label; });
}
