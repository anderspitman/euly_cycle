var fs = require('fs');
graph = require('./graph');

type = process.argv[2];
infile = process.argv[3];
outfile = process.argv[4];

var data = fs.readFileSync(infile, 'utf8').trim();

if (type === 'weighted') {
  var g = graph.fromTextWeighted(data);
}
else if (type === 'unweighted') {
  var g = graph.fromText(data);
}
console.log(g);
json = JSON.stringify(g, null, 2);
fs.writeFileSync(outfile, json);
