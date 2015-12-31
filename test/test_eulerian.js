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

      var na = Node.create('a'),
          nb = Node.create('b'),
          nd = Node.create('d');

      var eab = Edge.create(na, nb),
          ebd = Edge.create(nb, nd);

      var expPath = [eab, ebd];

      assert.deepEqual(path, expPath);
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

      var na = Node.create('a'),
          nb = Node.create('b'),
          nc = Node.create('c'),
          nd = Node.create('d'),
          ne = Node.create('e');

      var eab = Edge.create(na, nb),
          ebc = Edge.create(nb, nc),
          ecd = Edge.create(nc, nd),
          ede = Edge.create(nd, ne);

      var expPath = [eab, ebc, ecd, ede];

      assert.deepEqual(path, expPath);
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
      cycler.traverseEdge(Edge.create(node, toNode));
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

  describe('remake node path', function () {
    it('works', function () {
      var cycler = EulyCycler.create({});

      var n1 = Node.create('1'),
          n2 = Node.create('2'),
          n3 = Node.create('3');
      var e1 = Edge.create(n1, n2),
          e2 = Edge.create(n2, n3),
          e3 = Edge.create(n3, n1);

      var edgePath = [e1, e2, e3],
          expPath = [e2, e3, e1],
          obsPath = cycler._remakePathFromNewStartEdge(edgePath, e2);

      assert.deepEqual(obsPath, expPath);
    });
  });
});
