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

  $('#run_button').click(function() {

    var graphText = $('#text_box').val();

    var graph = new Graph(graphText);
    var cycler = new EulyCycler(graph);
    cycler.setCurrentNode(new Node('a'));

    cycler.eulerianCycle();
  });
});
