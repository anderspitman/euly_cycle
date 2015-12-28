var Graph = require('./graph').Graph;
var Node = require('./graph').Node;
var Edge = require('./graph').Edge;


var EulyCycler = function(graph) {
  this._graph = graph;
  this._visited = [];
};

EulyCycler.prototype.eulerianCycle = function() {
  var eulerianPath = [];
  var firstNodeInGraph = this._graph.getNodes()[0];
  var nextNodeWithOpenExit = firstNodeInGraph;

  while (true) {
    var path = this._walkUntilStuck(nextNodeWithOpenExit);
    var eulerianPath = this._mergePaths(eulerianPath, path);
    nextNodeWithOpenExit = this._findNodeWithOpenExit(eulerianPath);

    if (Node.isValid(nextNodeWithOpenExit)) {
      eulerianPath = this._remakePathFromNewStartNode(
        eulerianPath, nextNodeWithOpenExit);
    }
    else {
      break;
    }
  }

  return eulerianPath;
};

EulyCycler.prototype.getCurrentNode = function() {
  return this._currentNode;
};

EulyCycler.prototype.setCurrentNode = function(node) {
  this._currentNode = node;
};

EulyCycler.prototype.goTo = function(node) {
  var currentNode = this.getCurrentNode();
  this.setCurrentNode(node);
  var edge = new Edge(currentNode, node);
  this._visit(edge);
  return edge;
};

EulyCycler.prototype.getVisited = function(node) {
  return this._visited;
};

EulyCycler.prototype._walkUntilStuck = function(startNode) {
  var visitedNodes = [startNode];

  this.setCurrentNode(startNode);
  var unvisitedEdge = this._nextUnvisited(startNode);

  while (Edge.isValid(unvisitedEdge)) {
    next = unvisitedEdge.getToNode();
    var edge = this.goTo(next);
    visitedNodes.push(next);
    unvisitedEdge = this._nextUnvisited(next);
  }

  return visitedNodes;
};

EulyCycler.prototype._appendToEulerianPath = function(eulerianPath, newPath) {
  return eulerianPath.concat(newPath.slice(0, newPath.length-1));
};

EulyCycler.prototype._mergePaths = function(path1, path2) {
  if (path1.length === 0) {
    return path2;
  }
  else if (path2.lenght === 0) {
    return path1;
  }
  else {
    return path1.concat(path2.slice(1));
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

EulyCycler.prototype._hasOpenExit = function(node) {
  var outlinks = this._graph.getOutgoingEdges(node);

  for (var i=0; i<outlinks.length; i++) {
    outlink = outlinks[i];
    if (this._notVisited(outlink)) {
      return true;
    }
  }
  return false;
};

EulyCycler.prototype._remakePathFromNewStartNode = function(path, newStart) {
  var index = this._indexOfNode(path, newStart);
  var sliceIndexToEnd = path.slice(index, path.length-1);
  var sliceBeginningToIndex = path.slice(0, index+1);
  var newPath = sliceIndexToEnd.concat(sliceBeginningToIndex);
  return newPath;
};

EulyCycler.prototype._indexOfNode = function (iterable, node) {
  for (var i=0; i<iterable.length; i++) {
    if (node.equals(iterable[i])) {
      return i;
    }
  }
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
