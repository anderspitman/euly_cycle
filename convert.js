var fs = require('fs');
graph = require('./graph');

infile = process.argv[2];
outfile = process.argv[3];
var data = fs.readFileSync(infile, 'utf8').trim();
g = graph.buildFromText(data);
json = JSON.stringify(g, null, 2);
fs.writeFileSync(outfile, json);
