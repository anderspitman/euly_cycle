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

      var graph = new Graph(graphText);
      var cycler = new EulyCycler(graph);

      var cycle = cycler.eulerianCycle();

      var expCycle = [new Node('a'), new Node('b'), new Node('a')];
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

      var graph = new Graph(graphText);
      var cycler = new EulyCycler(graph);

      var expCycle = [new Node('b'), new Node('c'), new Node('a'),
                      new Node('b'), new Node('d'), new Node('e'),
                      new Node('b')];
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

      var graph = new Graph(graphText);
      var cycler = new EulyCycler(graph);

      var cycle = cycler.eulerianCycle();
      var expCycle = [new Node('6'), new Node('5'), new Node('4'),
                      new Node('2'), new Node('1'), new Node('0'),
                      new Node('3'), new Node('2'), new Node('6'),
                      new Node('8'), new Node('7'), new Node('9'),
                      new Node('6')];

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

      var graph = new Graph(graphText);
      var cycler = new EulyCycler(graph);

      var cycle = cycler.eulerianCycle();
      var expCycle = [new Node('c'), new Node('a'), new Node('b'),
                      new Node('d'), new Node('b'), new Node('c'),
                      new Node('e'), new Node('c')];

      assert.deepEqual(cycle, expCycle);
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

  describe('find next unvisited', function () {
    it('works', function () {
      var graphText = [
        'a -> b, c',
        'b -> a, c',
      ].join('\n');

      var graph = new Graph(graphText);
      var cycler = new EulyCycler(graph);

      startNode = new Node('a');
      expUnvisited = new Edge(startNode, new Node('b'));

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

      var graph = new Graph(graphText);
      var cycler = new EulyCycler(graph);

      var path1 = [new Node('a'), new Node('b'), new Node('c')];
      var path2 = [new Node('c'), new Node('d'), new Node('e')];
      var expPath = [new Node('a'), new Node('b'), new Node('c'),
                     new Node('d'), new Node('e')];

      var mergedPath = cycler._mergePaths(path1, path2);

      assert.deepEqual(mergedPath, expPath);

    });

    it('1st path empty returns 2nd path', function() {
      var graphText = [
        'a -> b, c',
        'b -> a, c',
      ].join('\n');

      var graph = new Graph(graphText);
      var cycler = new EulyCycler(graph);

      var path1 = [];
      var path2 = [new Node('a'), new Node('b'), new Node('c')];

      var mergedPath = cycler._mergePaths(path1, path2);

      assert.deepEqual(mergedPath, path2);
    });


    it('2nd path empty returns 1st path', function() {
      var graphText = [
        'a -> b, c',
        'b -> a, c',
      ].join('\n');

      var graph = new Graph(graphText);
      var cycler = new EulyCycler(graph);

      var path1 = [new Node('a'), new Node('b'), new Node('c')];
      var path2 = [];

      var mergedPath = cycler._mergePaths(path1, path2);

      assert.deepEqual(mergedPath, path1);
    });
  });
});
