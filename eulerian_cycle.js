var fs = require('fs');
var Graph = require('./src/graph').Graph;
var EulyCycler = require('./src/eulerian');

var infile = process.argv[2];
var outfile = process.argv[3];

var data = fs.readFileSync(infile, 'utf8').trim();

var graph = Graph.create(data);
var cycler = EulyCycler.create(graph);
cycler.addPathListener(function(path) {
  console.log(path);
});

var eulerianCycle = cycler.eulerianCycle();

var string = cycler.pathToString(eulerianCycle);
string = string.slice(0, string.length-2);
//console.log(string);

fs.writeFileSync(outfile, string);
