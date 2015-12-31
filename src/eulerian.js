(function() {
  "use strict";

  var Graph = require('./graph').Graph;
  var Node = require('./graph').Node;
  var Edge = require('./graph').Edge;


  var EulyCycler = function(graph) {
    this._graph = graph;
    this._visited = [];
    this._edgePaths = [];
  };

  EulyCycler.create = function(graph) {
    return new EulyCycler(graph);
  };

  EulyCycler.prototype.eulerianCycle = function() {
    var eulerianEdgePath = [];
    var firstNodeInGraph = this._graph.getNodes()[0];
    var nextNodeWithOpenExit = firstNodeInGraph;

    while (true) {
      var edgePath = this._walkUntilStuck(nextNodeWithOpenExit);

      eulerianEdgePath = eulerianEdgePath.concat(edgePath);
      this._edgePaths.push(eulerianEdgePath);
      var edgeThatSharesOpen = this._findEdgeThatSharesOpen(eulerianEdgePath);


      if (Edge.isValid(edgeThatSharesOpen)) {
        nextNodeWithOpenExit = edgeThatSharesOpen.getFromNode();
        eulerianEdgePath = this._remakePathFromNewStartEdge(
          eulerianEdgePath, edgeThatSharesOpen);
      }
      else {
        break;
      }
    }

    return this._nodePathFromEdgePath(eulerianEdgePath);
  };

  EulyCycler.prototype.getCurrentNode = function() {
    return this._currentNode;
  };

  EulyCycler.prototype.setCurrentNode = function(node) {
    this._currentNode = node;
  };

  EulyCycler.prototype.traverseEdge = function(edge) {
    this.setCurrentNode(edge.getToNode());
    this._visited.push(edge);
  };

  EulyCycler.prototype.getVisited = function() {
    return this._visited;
  };

  EulyCycler.prototype.getAllEdgePaths = function() {
    return this._edgePaths;
  };

  EulyCycler.prototype.pathToString = function(path) {
    var string = '';
    for (var i=0; i<path.length; i++) {
      var node = path[i];
      string += (node.getName() + '->');
    }
    return string;
  };

  EulyCycler.prototype._walkUntilStuck = function(startNode) {
    var edgePath = [];

    this.setCurrentNode(startNode);
    var unvisitedEdge = this._nextUnvisited(startNode);

    while (Edge.isValid(unvisitedEdge)) {
      this.traverseEdge(unvisitedEdge);
      edgePath.push(unvisitedEdge);
      unvisitedEdge = this._nextUnvisited(unvisitedEdge.getToNode());
    }

    return edgePath;
  };

  EulyCycler.prototype._nextUnvisited = function(fromNode) {
    var outgoingEdges = this._graph.getOutgoingEdges(fromNode);

    for (var i=0; i<outgoingEdges.length; i++) {
      var edge = outgoingEdges[i];
      if (this._notVisited(edge)) {
        return edge;
      }
    }
  };

  EulyCycler.prototype._notVisited = function(edge) {
    for (var i=0; i<this._visited.length; i++) {
      var visited = this._visited[i];
      if (edge.equals(visited)) {
        return false;
      }
    }
    return true;
  };

  EulyCycler.prototype._findNodeWithOpenExit = function(visited) {
    for (var i=0; i<visited.length; i++) {
      var node = visited[i];
      if (this._hasOpenExit(node)) {
        return node;
      }
    }
  };

  EulyCycler.prototype._findEdgeThatSharesOpen = function(visitedEdges) {
    for (var i=0; i<visitedEdges.length; i++) {
      var edge = visitedEdges[i];
      var openEdge = this._findOpenEdge(edge.getFromNode());
      if (Edge.isValid(openEdge)) {
        return edge;
      }
    }
    return undefined;
  };

  EulyCycler.prototype._findOpenEdge = function(node) {
    var outgoingEdges = this._graph.getOutgoingEdges(node);
    for (var i=0; i<outgoingEdges.length; i++) {
      var edge = outgoingEdges[i];
      if (this._notVisited(edge)) {
        return edge;
      }
    }
    return undefined;
  };

  EulyCycler.prototype._hasOpenExit = function(node) {
    var outlinks = this._graph.getOutgoingEdges(node);

    for (var i=0; i<outlinks.length; i++) {
      var outlink = outlinks[i];
      if (this._notVisited(outlink)) {
        return true;
      }
    }
    return false;
  };

  EulyCycler.prototype._remakePathFromNewStartEdge = function(path, newStart) {
    var index = this._indexOfComparable(path, newStart);
    var sliceIndexToEnd = path.slice(index);
    var sliceBeginningToIndex = path.slice(0, index);
    var newPath = sliceIndexToEnd.concat(sliceBeginningToIndex);
    return newPath;
  };

  EulyCycler.prototype._indexOfComparable = function (arrayLike, item) {
    for (var i=0; i<arrayLike.length; i++) {
      if (item.equals(arrayLike[i])) {
        return i;
      }
    }
    throw new Error('index not found');
  };

  EulyCycler.prototype._nodePathFromEdgePath = function(edgePath) {
    var nodePath = [];
    for (var i=0; i<edgePath.length; i++) {
      var edge = edgePath[i];
      var node = edge.getFromNode();
      nodePath.push(node);
    }
    var lastEdge = edgePath[edgePath.length - 1];
    var lastNode = lastEdge.getToNode();
    nodePath.push(lastNode);

    return nodePath;
  };


  module.exports = EulyCycler;

}());
