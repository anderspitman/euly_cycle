var assert = require('assert');

var Graph = require('../src/graph.js').Graph;
var Node = require('../src/graph.js').Node;
var Edge = require('../src/graph.js').Edge;
var EulyCycler = require('../src/eulerian.js');


describe('euly', function() {
  describe('eulerian cycle', function () {
    it('simple', function () {
      var graphText = [
        'a -> b',
        'b -> a'
      ].join('\n');

      var graph = Graph.create(graphText);
      var cycler = EulyCycler.create(graph);

      var cycle = cycler.eulerianCycle();

      var expCycle = [Node.create('a'), Node.create('b'), Node.create('a')];
      assert.deepEqual(cycle, expCycle);
    });

    it('works', function () {
      var graphText = [
        'a -> b',
        'b -> c, d',
        'c -> a',
        'd -> e',
        'e -> b'
      ].join('\n');

      var graph = Graph.create(graphText);
      var cycler = EulyCycler.create(graph);

      var expCycle = [Node.create('b'), Node.create('c'), Node.create('a'),
                      Node.create('b'), Node.create('d'), Node.create('e'),
                      Node.create('b')];
      var cycle = cycler.eulerianCycle();
      assert.deepEqual(cycle, expCycle);
    });

    it('test', function() {
      var graphText = [
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

      var graph = Graph.create(graphText);
      var cycler = EulyCycler.create(graph);

      var cycle = cycler.eulerianCycle();
      var expCycle = [Node.create('6'), Node.create('5'), Node.create('4'),
                      Node.create('2'), Node.create('1'), Node.create('0'),
                      Node.create('3'), Node.create('2'), Node.create('6'),
                      Node.create('8'), Node.create('7'), Node.create('9'),
                      Node.create('6')];

      assert.deepEqual(cycle, expCycle);
    });

    it('search entire visited nodes for open exits', function() {
      var graphText = [
        'a -> b',
        'b -> c, d',
        'c -> a, e',
        'd -> b',
        'e -> c'
      ].join('\n');

      var graph = Graph.create(graphText);
      var cycler = EulyCycler.create(graph);

      var cycle = cycler.eulerianCycle();
      var expCycle = [Node.create('c'), Node.create('a'), Node.create('b'),
                      Node.create('d'), Node.create('b'), Node.create('c'),
                      Node.create('e'), Node.create('c')];

      assert.deepEqual(cycle, expCycle);
    });
  });

  describe('walk until stuck', function () {
    it('simple', function () {
      var graphText = [
        'a -> b, c',
        'b -> d',
      ].join('\n');

      var graph = Graph.create(graphText);
      var cycler = EulyCycler.create(graph);

      var node = Node.create('a');
      var path = cycler._walkUntilStuck(node);

      var expPath = [Node.create('a'), Node.create('b'), Node.create('d')];
      var expVisited = [
        Edge.create(Node.create('a'), Node.create('b')),
        Edge.create(Node.create('b'), Node.create('d'))
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

      var graph = Graph.create(graphText);
      var cycler = EulyCycler.create(graph);

      var node = Node.create('a');
      var path = cycler._walkUntilStuck(node);

      var expPath = [
        Node.create('a'),
        Node.create('b'),
        Node.create('c'),
        Node.create('d'),
        Node.create('e')
      ];

      var expVisited = [
        Edge.create(Node.create('a'), Node.create('b')),
        Edge.create(Node.create('b'), Node.create('c')),
        Edge.create(Node.create('c'), Node.create('d')),
        Edge.create(Node.create('d'), Node.create('e'))
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

      graph = Graph.create(graphText);
      cycler = EulyCycler.create(graph);

      var node = Node.create('a');
      cycler.setCurrentNode(node);

      assert(node.equals(cycler.getCurrentNode()));
    });
  });

  describe('go to', function () {
    it('simple', function () {
      var graphText = [
        'a -> b, c'
      ].join('\n');

      var graph = Graph.create(graphText);
      var cycler = EulyCycler.create(graph);

      var node = Node.create('a');
      cycler.setCurrentNode(node);
      var toNode = Node.create('b');
      cycler.goTo(toNode);
      var expVisited = [Edge.create(node, toNode)];

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

      var graph = Graph.create(graphText);
      var cycler = EulyCycler.create(graph);
      var edge = Edge.create(Node.create('a'), Node.create('b'));

      assert(cycler._notVisited(edge));
    });

    it('false', function () {
      var graphText = [
        'a -> b, c',
        'b -> a, c',
      ].join('\n');

      var graph = Graph.create(graphText);
      var cycler = EulyCycler.create(graph);
      var edge = Edge.create(Node.create('a'), Node.create('b'));

      cycler._visited.push(edge);

      assert(!cycler._notVisited(edge));
    });
  });

  describe('find next unvisited', function () {
    it('works', function () {
      var graphText = [
        'a -> b, c',
        'b -> a, c',
      ].join('\n');

      var graph = Graph.create(graphText);
      var cycler = EulyCycler.create(graph);

      startNode = Node.create('a');
      expUnvisited = Edge.create(startNode, Node.create('b'));

      var edge = cycler._nextUnvisited(startNode);
      assert.deepEqual(edge, expUnvisited);
    });
  });

  describe('merge paths', function () {
    it('works', function () {
      var graphText = [
        'a -> b, c',
        'b -> a, c',
      ].join('\n');

      var graph = Graph.create(graphText);
      var cycler = EulyCycler.create(graph);

      var path1 = [Node.create('a'), Node.create('b'), Node.create('c')];
      var path2 = [Node.create('c'), Node.create('d'), Node.create('e')];
      var expPath = [Node.create('a'), Node.create('b'), Node.create('c'),
                     Node.create('d'), Node.create('e')];

      var mergedPath = cycler._mergePaths(path1, path2);

      assert.deepEqual(mergedPath, expPath);

    });

    it('1st path empty returns 2nd path', function() {
      var graphText = [
        'a -> b, c',
        'b -> a, c',
      ].join('\n');

      var graph = Graph.create(graphText);
      var cycler = EulyCycler.create(graph);

      var path1 = [];
      var path2 = [Node.create('a'), Node.create('b'), Node.create('c')];

      var mergedPath = cycler._mergePaths(path1, path2);

      assert.deepEqual(mergedPath, path2);
    });


    it('2nd path empty returns 1st path', function() {
      var graphText = [
        'a -> b, c',
        'b -> a, c',
      ].join('\n');

      var graph = Graph.create(graphText);
      var cycler = EulyCycler.create(graph);

      var path1 = [Node.create('a'), Node.create('b'), Node.create('c')];
      var path2 = [];

      var mergedPath = cycler._mergePaths(path1, path2);

      assert.deepEqual(mergedPath, path1);
    });
  });

  describe('observe paths', function () {
    it('simple - called once', function () {
      var graphText = [
        'a -> b',
        'b -> a',
      ].join('\n');

      var graph = Graph.create(graphText);
      var cycler = EulyCycler.create(graph);

      var obsPath = [];
      cycler.addPathListener(function(path) {
        obsPath = path
      });

      cycler.eulerianCycle();

      var expPath = [Node.create('a'), Node.create('b'), Node.create('a')];

      assert.deepEqual(obsPath, expPath);
    });

    it('called multiple times', function () {
      var graphText = [
        'a -> b',
        'b -> a, c',
        'c -> b'
      ].join('\n');

      var graph = Graph.create(graphText);
      var cycler = EulyCycler.create(graph);

      var obsPaths = cycler.eulerianCycleIntermediate();

      var expPaths = [
        [Node.create('a'), Node.create('b'), Node.create('a')],
        [Node.create('b'), Node.create('a'), Node.create('b'),
         Node.create('c'), Node.create('b')]
      ];

      assert.deepEqual(obsPaths, expPaths);
    });
  });
});
