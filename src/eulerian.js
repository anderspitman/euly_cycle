(function() {
  "use strict";

  var Graph = require('./graph').Graph;
  var Node = require('./graph').Node;
  var Edge = require('./graph').Edge;


  var EulyCycler = function(graph) {
    this._graph = graph;
    this._visited = [];
    this._pathListeners = [];
    this._edgePaths = [];
    this._edgePath = [];
  };

  EulyCycler.create = function(graph) {
    return new EulyCycler(graph);
  };

  EulyCycler.prototype.eulerianCycle = function() {
    var eulerianPath = [];
    var eulerianEdgePath = [];
    var firstNodeInGraph = this._graph.getNodes()[0];
    var nextNodeWithOpenExit = firstNodeInGraph;

    while (true) {
      var path = this._walkUntilStuck(nextNodeWithOpenExit);
      eulerianPath = this._mergePaths(eulerianPath, path);
      this._notifyPathListeners(eulerianPath);
      nextNodeWithOpenExit = this._findNodeWithOpenExit(eulerianPath);

      eulerianEdgePath = this._mergeEdgePaths(eulerianEdgePath, this._edgePath);
      this._edgePaths.push(eulerianEdgePath);
      var edgeThatSharesOpen = this._findEdgeThatSharesOpen(eulerianEdgePath);

      if (Node.isValid(nextNodeWithOpenExit)) {
        eulerianPath = this._remakePathFromNewStartNode(
          eulerianPath, nextNodeWithOpenExit);
        eulerianEdgePath = this._remakePathFromNewStartEdge(
          eulerianEdgePath, edgeThatSharesOpen);
      }
      else {
        break;
      }
    }


    return eulerianPath;
  };

  EulyCycler.prototype.eulerianCycleIntermediate = function() {
    var intermediatePaths = [];
    this.addPathListener(function(path) {
      intermediatePaths.push(path);
    });

    this.eulerianCycle();
    return intermediatePaths;
  };

  EulyCycler.prototype.addPathListener = function(callback) {
    this._pathListeners.push(callback);
  };

  EulyCycler.prototype.getCurrentNode = function() {
    return this._currentNode;
  };

  EulyCycler.prototype.setCurrentNode = function(node) {
    this._currentNode = node;
  };

  EulyCycler.prototype.traverseEdge = function(edge) {
    this.setCurrentNode(edge.getToNode());
    this._visit(edge);
  };

  EulyCycler.prototype.getVisited = function(node) {
    return this._visited;
  };

  EulyCycler.prototype._notifyPathListeners = function(path) {
    for (var i=0; i<this._pathListeners.length; i++) {
      var listener = this._pathListeners[i];
      listener(path);
    }
  };

  EulyCycler.prototype._walkUntilStuck = function(startNode) {
    var visitedNodes = [startNode];
    var visitedEdges = [];
    this._edgePath = [];

    this.setCurrentNode(startNode);
    var unvisitedEdge = this._nextUnvisited(startNode);

    while (Edge.isValid(unvisitedEdge)) {
      this.traverseEdge(unvisitedEdge);
      visitedEdges.push(unvisitedEdge);
      visitedNodes.push(unvisitedEdge.getToNode());
      this._edgePath.push(unvisitedEdge);
      unvisitedEdge = this._nextUnvisited(unvisitedEdge.getToNode());
    }

    //this._edgePaths.push(visitedEdges);
    return visitedNodes;
  };

  EulyCycler.prototype._mergePaths = function(path1, path2) {
    if (path1.length === 0) {
      return path2;
    }
    else if (path2.length === 0) {
      return path1;
    }
    else {
      return path1.concat(path2.slice(1));
    }
  };

  EulyCycler.prototype._mergeEdgePaths = function(path1, path2) {
    if (path1.length === 0) {
      return path2;
    }
    else if (path2.length === 0) {
      return path1;
    }
    else {
      return path1.concat(path2);
    }
  };

  EulyCycler.prototype._visit = function(edge) {
    this._visited.push(edge);
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

  EulyCycler.prototype._remakePathFromNewStartNode = function(path, newStart) {
    var index = this._indexOfComparable(path, newStart);
    var sliceIndexToEnd = path.slice(index, path.length-1);
    var sliceBeginningToIndex = path.slice(0, index+1);
    var newPath = sliceIndexToEnd.concat(sliceBeginningToIndex);
    return newPath;
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

  EulyCycler.prototype.pathToString = function(path) {
    var string = '';
    for (var i=0; i<path.length; i++) {
      var node = path[i];
      string += (node.getName() + '->');
    }
    return string;
  };


  module.exports = EulyCycler;

}());
