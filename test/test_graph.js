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

      var graph = Graph.create(graphText);
      var expNodes = [Node.create('a'), Node.create('b')];

      assert.deepEqual(graph.getNodes(), expNodes);
    });
  });

  describe('set from text', function () {
    it('simple', function () {
      var graphText = [
        'a -> b',
      ].join('\n');

      var graph = Graph.create(graphText);
      assert.deepEqual(graph._getGraph(), {'a': ['b'], 'b': []});
    });

    it('multiple outnodes', function () {
      var graphText = [
        'a -> b, c',
      ].join('\n');

      graph = Graph.create(graphText);
      assert.deepEqual(graph._getGraph(), {'a': ['b', 'c'], 'b': [], 'c': []});
    });

    it('multiple nodes', function () {
      var graphText = [
        'a -> b, c',
        'b -> a, c',
      ].join('\n');

      var graph = Graph.create(graphText);
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

      var graph = Graph.create(graphText);
      var node = Node.create('a');
      var outgoingEdges = graph.getOutgoingEdges(node);
      var expOutgoingEdges = [
        Edge.create(node, Node.create('b')),
        Edge.create(node, Node.create('c'))
      ];
      
      assert.deepEqual(outgoingEdges, expOutgoingEdges);
    });

    it('multiple edges between 2 nodes', function() {
      var graphText = [
        'a -> b, b'
      ].join('\n');

      var graph = Graph.create(graphText);
      var node = Node.create('a');
      var outgoingEdges = graph.getOutgoingEdges(node);

      var secondEdge = Edge.create(node, Node.create('b'));
      secondEdge.setIndex(1);

      var expOutgoingEdges = [
        Edge.create(node, Node.create('b')),
        secondEdge
      ];

      assert.deepEqual(outgoingEdges, expOutgoingEdges);
    });

    it('multiple edges between multiple nodes', function() {
      var graphText = [
        'a -> b, b, c',
      ].join('\n');

      var graph = Graph.create(graphText);
      var node = Node.create('a');
      var outgoingEdges = graph.getOutgoingEdges(node);

      var secondEdge = Edge.create(node, Node.create('b'));
      secondEdge.setIndex(1);

      var expOutgoingEdges = [
        Edge.create(node, Node.create('b')),
        secondEdge,
        Edge.create(node, Node.create('c'))
      ];

      assert.deepEqual(outgoingEdges, expOutgoingEdges);
    });
  });
});

describe('node', function() {
  describe('creation', function() {
    it('works', function() {
      var node = Node.create('a');

      assert.equal('a', node.getName());
    });

    it('factory', function() {
      var node = Node.create('a');
      assert.equal('a', node.getName());
    });
  });
});


describe('edge', function() {
  describe('creation', function() {
    it('works', function() {
      var fromNode = Node.create('a');
      var toNode = Node.create('b');
      var edge = Edge.create(fromNode, toNode);

      assert.deepEqual(fromNode, edge.getFromNode());
      assert.deepEqual(toNode, edge.getToNode());
    });

    it('factory', function() {
      var fromNode = Node.create('a');
      var toNode = Node.create('b');
      var edge = Edge.create(fromNode, toNode);

      assert.deepEqual(fromNode, edge.getFromNode());
      assert.deepEqual(toNode, edge.getToNode());
    });
  });

  describe('equality', function() {
    it('works', function() {
      var edge1 = Edge.create(Node.create('a'), Node.create('b'));
      var edge2 = Edge.create(Node.create('a'), Node.create('b'));

      assert(edge1.equals(edge2));
    });

    it('depends on id', function() {
      var edge1 = Edge.create(Node.create('a'), Node.create('b'));
      var edge2 = Edge.create(Node.create('a'), Node.create('b'));
      edge2.setIndex(1);

      assert(!edge1.equals(edge2));
    });

  });
});
