var assert = require('assert');

var Graph = require('../src/graph.js').Graph;
var Node = require('../src/graph.js').Node;
var Edge = require('../src/graph.js').Edge;


describe('graph', function() {

  describe('get nodes', function () {
    it('simple', function () {
      var graphText = [
        'a -> b',
      ].join('\n');

      var graph = new Graph(graphText);
      var expNodes = [new Node('a'), new Node('b')];

      assert.deepEqual(graph.getNodes(), expNodes);
    });
  });

  describe('set from text', function () {
    it('simple', function () {
      var graphText = [
        'a -> b',
      ].join('\n');

      var graph = new Graph(graphText);
      assert.deepEqual(graph._getGraph(), {'a': ['b'], 'b': []});
    });

    it('multiple outnodes', function () {
      var graphText = [
        'a -> b, c',
      ].join('\n');

      graph = new Graph(graphText);
      assert.deepEqual(graph._getGraph(), {'a': ['b', 'c'], 'b': [], 'c': []});
    });

    it('multiple nodes', function () {
      var graphText = [
        'a -> b, c',
        'b -> a, c',
      ].join('\n');

      var graph = new Graph(graphText);
      var expGraph = {'a': ['b', 'c'], 'b': ['a', 'c'], 'c': []};
      assert.deepEqual(graph._getGraph(), expGraph);
    });
  });

  describe('get outgoing edges', function() {
    it('exists', function() {
      var graphText = [
        'a -> b, c',
        'b -> a, c',
      ].join('\n');

      var graph = new Graph(graphText);
      var node = new Node('a');
      var outgoingEdges = graph.getOutgoingEdges(node);
      var expOutgoingEdges = [
        new Edge(node, new Node('b')),
        new Edge(node, new Node('c'))
      ];

      //var expOutgoingEdges = [new Node('b'), new Node('c')];
      
      assert.deepEqual(outgoingEdges, expOutgoingEdges);
    });
  });
});

describe('edge', function() {
  describe('creation', function() {
    it('works', function() {
      var fromNode = new Node('a');
      var toNode = new Node('b');
      var edge = new Edge(fromNode, toNode);

      assert.deepEqual(fromNode, edge.getFromNode());
      assert.deepEqual(toNode, edge.getToNode());
    });
  });
});
