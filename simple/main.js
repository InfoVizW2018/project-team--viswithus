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
  playSales = psls;
  playTotals = plttls;
  plays = pl;

  initStatistics();  
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

function showModal() {
  $('.ui.basic.modal').modal('show');
}

