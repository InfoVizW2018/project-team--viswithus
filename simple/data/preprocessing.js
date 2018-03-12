"use strict"

const fs = require('fs');

const dataFiles = fs.readdirSync('.').filter( x => x.substr(x.length - 5) === ".json");

dataFiles.forEach( filename => {
  let dataArray = JSON.parse(fs.readFileSync(filename));
  dataArray = dataArray.map( item => {
    Object.keys(item)
      .filter( key => typeof item[key] === "string")
      .forEach( key => item[key] = item[key].trim());
    return item;
  });
  fs.writeFileSync(`new_${filename}`, JSON.stringify(dataArray, null, 2));
});