var assert = require('assert');

var Graph = require('../src/graph.js').Graph;
var Node = require('../src/graph.js').Node;
var Edge = require('../src/graph.js').Edge;
var EulyCycler = require('../src/eulerian.js');

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

describe('euly', function() {
  describe('eulerian cycle', function () {
    it('works', function () {
      var graphText = [
        'a -> b, d, f',
        'b -> c',
        'c -> a',
        'd -> e',
        'e -> a',
        'f -> g',
        'g -> a',
      ].join('\n');

      var graph = new Graph(graphText);
      var cycler = new EulyCycler(graph);

      cycler.eulerianCycle();
    });
  });

  describe('walk until stuck', function () {
    it('simple', function () {
      var graphText = [
        'a -> b, c',
        'b -> d',
      ].join('\n');

      var graph = new Graph(graphText);
      var cycler = new EulyCycler(graph);

      var node = new Node('a');
      var path = cycler._walkUntilStuck(node);

      var expPath = [new Node('a'), new Node('b'), new Node('d')];
      var expVisited = [
        new Edge(new Node('a'), new Node('b')),
        new Edge(new Node('b'), new Node('d'))
      ];

      assert.deepEqual(path, expPath);
      assert.deepEqual(cycler.getVisited(), expVisited);
    });

    it('long', function () {
      var graphText = [
        'a -> b',
        'b -> c',
        'c -> d',
        'd -> e',
      ].join('\n');

      var graph = new Graph(graphText);
      var cycler = new EulyCycler(graph);

      var node = new Node('a');
      var path = cycler._walkUntilStuck(node);

      var expPath = [
        new Node('a'),
        new Node('b'),
        new Node('c'),
        new Node('d'),
        new Node('e')
      ];

      var expVisited = [
        new Edge(new Node('a'), new Node('b')),
        new Edge(new Node('b'), new Node('c')),
        new Edge(new Node('c'), new Node('d')),
        new Edge(new Node('d'), new Node('e'))
      ];

      assert.deepEqual(path, expPath);
      assert.deepEqual(cycler.getVisited(), expVisited);
    });
  });

  describe('set current node', function () {
    it('simple', function () {
      var graphText = [
        'a -> b, c'
      ].join('\n');

      graph = new Graph(graphText);
      cycler = new EulyCycler(graph);

      var node = new Node('a');
      cycler.setCurrentNode(node);

      assert(node.equals(cycler.getCurrentNode()));
    });
  });

  describe('go to', function () {
    it('simple', function () {
      var graphText = [
        'a -> b, c'
      ].join('\n');

      var graph = new Graph(graphText);
      var cycler = new EulyCycler(graph);

      var node = new Node('a');
      cycler.setCurrentNode(node);
      var toNode = new Node('b');
      cycler.goTo(toNode);
      var expVisited = [new Edge(node, toNode)];

      assert(toNode.equals(cycler.getCurrentNode()));
      assert.deepEqual(cycler.getVisited(), expVisited);

    });
  });

  describe('not visited', function () {
    it('true', function () {
      var graphText = [
        'a -> b, c',
        'b -> a, c',
      ].join('\n');

      var graph = new Graph(graphText);
      var cycler = new EulyCycler(graph);
      var edge = new Edge(new Node('a'), new Node('b'));

      assert(cycler._notVisited(edge));
    });

    it('false', function () {
      var graphText = [
        'a -> b, c',
        'b -> a, c',
      ].join('\n');

      var graph = new Graph(graphText);
      var cycler = new EulyCycler(graph);
      var edge = new Edge(new Node('a'), new Node('b'));

      cycler._visited.push(edge);

      assert(!cycler._notVisited(edge));
    });
  });

  //describe('find next unvisited', function () {
  //  it('works', function () {
  //    var graphText = [
  //      'a -> b, c',
  //      'b -> a, c',
  //    ].join('\n');

  //    var graph = new Graph(graphText);
  //    var cycler = new EulyCycler(graph);

  //    startNode = new Node('a');
  //    expUnvisited = new Edge(startNode, new Node('b'));

  //    var edge = cycler._nextUnvisited(startNode);
  //    assert.deepEqual(edge, expUnvisited);
  //  });
  //});
});
