var Graph = require('./graph').Graph;
var Node = require('./graph').Node;
var EulyCycler = require('./eulerian');


$(document).ready(function() {
  var graphTextInit = [
    '0 -> 3',
    '1 -> 0',
    '2 -> 1,6',
    '3 -> 2',
    '4 -> 2',
    '5 -> 4',
    '6 -> 5,8',
    '7 -> 9',
    '8 -> 7',
    '9 -> 6'
  ].join('\n');

  $('#text_box').val(graphTextInit);

  run();

  $('#run_button').click(function() {
    run();
  });
});

function run() {
  var graphText = $('#text_box').val();
  var graph = Graph.create(graphText);
  var nodes = graph.getNodes();
  createVisualNodes(nodes);

  var cycler = EulyCycler.create(graph);
  cycler.addPathListener(mod.pathListener);
  var cycle = cycler.eulerianCycle();
  var paths = mod.getAllPaths();
  console.log(paths);
  changeColor(paths, 0, 0);
}

function createVisualNodes(nodes) {
  console.log("Create nodes");
  ids = [];
  for (var i=0; i<nodes.length; i++) {
    var node = nodes[i];
    console.log(node);
    ids.push(node.getName());
  }

  var source = $('#node_template').html();
  var template = Handlebars.compile(source);
  var html = template({ids: ids});

  $('#wrapper').html(html);
}

function changeColor(paths, pathIdx, nodeIdx) {
  var path = paths[pathIdx];
  var node = path[nodeIdx];
  var selector = '#node_' + node.getName();
  $(selector).css('background-color', 'red');

  setTimeout(function() {
    var nextNodeIdx = -1;
    var nextPathIdx = pathIdx;

    if (nodeIdx === path.length - 1) {
      nextNodeIdx = 0;
      nextPathIdx = pathIdx + 1; 
      if (nextPathIdx === paths.length) {
        return;
      }
    }
    else {
      nextNodeIdx = nodeIdx + 1;
    }
    changeColor(paths, nextPathIdx, nextNodeIdx);
  }, 100);
}


var mod = (function() {

  var paths = [];

  var publicPathListener = function(path) {
    paths.push(path);
  }

  var publicGetAllPaths = function() {
    return paths;
  }

  return {
    pathListener: publicPathListener,
    getAllPaths: publicGetAllPaths
  }
})();
