"use strict"

const fs = require('fs');

const PATH = {
  PEOPLE     : 'people.json',
  PERFORM    : 'performance_with_totals.json',
  TICKET     : 'play_ticket_sales.json',
  PLAY_TOTALS: 'plays_with_totals.json',
  PLAYS      : 'plays.json'
}

const flagMapping = {
  /**
   * Reads all JSON files in directory and trims (removes trailing whitespace) from strings
   * in the fields of that data. Assumes data is JSON array and does not process nested arrays.
   */
  '--trim-data': () => {
    process.stdout.write('Trimming array data in directory...');
    const dataFiles = fs.readdirSync('.').filter( x => x.substr(x.length - 5) === '.json');

    dataFiles.forEach( filename => {
      let dataArray = JSON.parse(fs.readFileSync(filename));
      dataArray = dataArray.map( item => {
        Object.keys(item)
          .filter( key => typeof item[key] === 'string')
          .forEach( key => item[key] = item[key].trim());
        return item;
      });
      fs.writeFileSync(`${filename}`, JSON.stringify(dataArray, null, 2));
    });
    process.stdout.write(' DONE\n');
  },
  /**
   * Read plays.json and adds a list of dates that the play was performed to the 
   * data.
   */
  '--play-dates': () => {
    process.stdout.write('Extracting performance dates...');
    const performanceTotals = JSON.parse(fs.readFileSync(PATH.PERFORM, 'utf8'));
    const plays = JSON.parse(fs.readFileSync(PATH.PLAYS, 'utf8'));

    plays.forEach( play => {
      play.dates = performanceTotals
        .filter( x => x.id === play.id )
        .map( x => x.date )
        .sort( (a, b) => Date.parse(a) - Date.parse(b));
    });
    
    fs.writeFileSync(PATH.PLAYS, JSON.stringify(plays, null, 2));
    process.stdout.write(' DONE\n');
  },
  /**
   * Writes three lists to a new file. These lists are: unique authors, unique plays, and unique genres.
   */
  '--write-unique': () => {
    process.stdout.write('Extracting unique data...');
    const plays = JSON.parse(fs.readFileSync(PATH.PLAYS, 'utf8'));

    var unique = plays
      .filter( x => x.dates.length)
      .reduce((prev, curr) => {
        if (curr.title && curr.title.length && !prev.plays.some(x => x === curr.title))
          prev.plays.push(curr.title)
        if (curr.genre && curr.genre.length > 1 && !prev.genres.some(x => x === curr.genre))
          prev.genres.push(curr.genre);
        if (curr.author && curr.author.length && !prev.authors.some(x => x === curr.author))
          prev.authors.push(curr.author);
        return prev;
      }, { plays: [], genres: [], authors: []});
    
    Object.keys(unique).forEach( k => unique[k] = unique[k].sort());

    fs.writeFileSync(`unique_data.json`, JSON.stringify(unique, null, 2));
    process.stdout.write(' DONE\n');
  },
  /**
   * Read all the data and write a statistics file that includes some aggregated info about the data.
   */
  '--statistics': () => {
    process.stdout.write('Writing statistics...');
    const people            = JSON.parse(fs.readFileSync(PATH.PEOPLE, 'utf8'));
    const performanceTotals = JSON.parse(fs.readFileSync(PATH.PERFORM, 'utf8'));
    const playSales         = JSON.parse(fs.readFileSync(PATH.TICKET, 'utf8'));
    const playTotals        = JSON.parse(fs.readFileSync(PATH.PLAY_TOTALS, 'utf8'));
    const plays             = JSON.parse(fs.readFileSync(PATH.PLAYS, 'utf8'));

    const statistics = {};

    statistics.people = {
      number: people.length,
      label: "People"
    }

    statistics.plays = {
      number: plays.length,
      label: "Plays"
    }

    statistics.playSales = {
      number: playSales.length,
      label: "Sales Records"
    }

    statistics.performanceTotals = {
      number: performanceTotals.length,
      label: "Performances with Totals"
    }

    statistics.playTotals = {
      number: playTotals.length,
      label: "Plays with Totals"
    }

    fs.writeFileSync('statistics.json', JSON.stringify(statistics, null, 2));
    process.stdout.write(' DONE\n');
  },

  /**
   * Converts the dates in plays into objects with totals: string[] => { time: string, total: number }[]
   */
  '--total-sold': () => {
    process.stdout.write('Writing total sold to plays.js...');
    const plays = JSON.parse(fs.readFileSync(PATH.PLAYS, 'utf8'));
    const playSales = JSON.parse(fs.readFileSync(PATH.TICKET, 'utf8'));

    plays.forEach( play => {
      const sales = playSales.filter( x => x.title === play.title);
      play.dates = play.dates.map( date => ({
          time: date,
          total: sales
            .filter( x => x.date === date )
            .reduce( (prev, curr) => prev + curr.total_sold, 0)
        }));
      play.total_sold = play.dates.reduce( (prev, curr) => prev + curr.total, 0);
    });

    fs.writeFileSync('plays.json', JSON.stringify(plays, null, 2));
    process.stdout.write(' DONE\n');
  }

}


process.argv
  .filter( x => flagMapping[x] )
  .forEach( x => flagMapping[x]() );
