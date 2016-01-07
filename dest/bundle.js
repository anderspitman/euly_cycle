(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./graph":2}],2:[function(require,module,exports){
(function() {
  "use strict";


  var Node = function(name) {
    this._name = name;
  };

  Node.create = function(name) {
    return new Node(name);
  };

  Node.isValid = function(node) {
    return node !== undefined;
  };

  Node.prototype.getName = function() {
    return this._name;
  };

  Node.prototype.equals = function(other) {
    return this._name === other._name;
  };


  var Edge = function(fromNode, toNode) {
    this._fromNode = fromNode;
    this._toNode = toNode;
    this._index = 0;
  };

  Edge.create = function(fromNode, toNode) {
    return new Edge(fromNode, toNode);
  };

  Edge.isValid = function(edge) {
    return edge !== undefined;
  };

  Edge.prototype.getFromNode = function() {
    return this._fromNode;
  };

  Edge.prototype.getToNode = function() {
    return this._toNode;
  };

  Edge.prototype.equals = function(other) {
    return this._fromNode.equals(other._fromNode) &&
           this._toNode.equals(other._toNode) &&
           this._index === other._index;
  };

  Edge.prototype.connectsSameNodesAs = function(other) {
    return this._fromNode.equals(other._fromNode) &&
           this._toNode.equals(other._toNode);
  };

  Edge.prototype.setIndex = function(id) {
    this._index = id;
  };

  Edge.prototype.getIndex = function() {
    return this._index;
  };

  var Graph = function(text) {
      this._graph = this._fromText(text);
  };

  Graph.create = function(text) {
    return new Graph(text);
  };

  Graph.prototype.getNodes = function() {
    var keys = Object.keys(this._graph);
    var nodes = [];
    for (var i=0; i<keys.length; i++) {
      nodes.push(new Node(keys[i]));
    }
    return nodes;
  };

  Graph.prototype.getEdges = function() {
    var nodes = this.getNodes();
    var edges = [];

    for (var i=0; i<nodes.length; i++) {
      var node = nodes[i];
      var outgoingEdges = this.getOutgoingEdges(node);
      edges = edges.concat(outgoingEdges);
    }
    return edges;
  };

  Graph.prototype.getOutgoingEdges = function(fromNode) {
    var outlinks = this._graph[fromNode.getName()];

    var id = 0;
    var edges = [];
    for (var i=0; i<outlinks.length; i++) {
      var outlink = outlinks[i];
      var edge = new Edge(fromNode, new Node(outlink));
      
      // Multiple edges between the nodes
      if (outlink === prev) {
        ++id;
        edge.setIndex(id);
      }
      else {
        id = 0;
      }

      edges.push(edge);
      var prev = outlink;
    }
    return edges;
  };

  Graph.prototype._fromText = function(text, nodeSep, edgeSep) {
    nodeSep = typeof nodeSep !== 'undefined' ? nodeSep : '->';
    edgeSep = typeof edgeSep !== 'undefined' ? edgeSep : ',';
    var lines = text.split('\n');
    var graph = {};
    for (var i=0; i<lines.length; i++) {
      var line = lines[i].split(nodeSep);
      var node = line[0].trim();
      this._addIfNew(graph, node);
      var outlinks = line[1].split(edgeSep);
      for (var j=0; j<outlinks.length; j++) {
        outlinks[j] = outlinks[j].trim();
        this._addIfNew(graph, outlinks[j]);
      }
      graph[node] = outlinks;
    }

    return graph;
  };

  Graph.prototype._addIfNew = function(graph, key) {
     var idx = Object.keys(graph).indexOf(key);
     if (idx === -1) {
       graph[key] = [];
       idx = graph.length-1;
     }
     return idx;
  };


  Graph.prototype._getGraph = function() {
      return this._graph;
  };

  module.exports.Graph = Graph;
  module.exports.Node = Node;
  module.exports.Edge = Edge;

}());

},{}],3:[function(require,module,exports){
(function() {
  "use strict";

  var graphToD3 = (function() {

    function publicBuildLinks(graphEdges, graphNodes) {
      var links = [];
      for (var i=0; i<graphEdges.length; i+=1) {
        var edge = graphEdges[i];
        var duplicateEdgesCount = countDuplicateEdges(edge, graphEdges);

        var curveType = determineCurveType(duplicateEdgesCount,
                                           edge.getIndex());
        var curveWeight = computeCurveWeight(duplicateEdgesCount,
                                             edge.getIndex());
        
        var fromName = edge.getFromNode().getName();
        var toName = edge.getToNode().getName();
        var id = fromName + '_' + toName + '_' + edge.getIndex();

        links.push({
            'source': indexOfNode(edge.getFromNode(), graphNodes),
            'target': indexOfNode(edge.getToNode(), graphNodes),
            'id': id,
            'curve_type': curveType,
            'curve_weight': curveWeight
        });
      }
      return links;
    }

    function determineCurveType(duplicateEdgesCount, edgeId) {

      var curveType = 'straight';
      if (duplicateEdgesCount === 1 ||
          ((duplicateEdgesCount % 2 !== 0) &&
            edgeId === duplicateEdgesCount-1)) {
        curveType = 'straight';
      }
      else {
        if (edgeId % 2 === 0) {
          curveType = 'left';
        }
        else {
          curveType = 'right';
        }
      }

      return curveType;
    }

    function computeCurveWeight(duplicateEdgesCount, edgeId) {
      var count = edgeId + 1;
      return (1.0 / duplicateEdgesCount) * ((count + (count % 2)) / 2);
    }

    function countDuplicateEdges(edge, allEdges) {
      var count = 0;
      for (var i=0; i<allEdges.length; i++) {
        if (edge.connectsSameNodesAs(allEdges[i])) {
          count++;
        }
      }
      return count;
    }
    
    function indexOfNode(nodeToFind, nodes) {
      for (var i=0; i<nodes.length; i++) {
        var node = nodes[i];
        if (nodeToFind.equals(node)) {
          return i;
        }
      }
      return -1;
    }

    function publicBuildNodes(graphNodes) {
      var d3Nodes = [];
      for (var i=0; i<graphNodes.length; i++) {
        var node = graphNodes[i];
        d3Nodes.push({"name": node.getName()});
      }
      return d3Nodes;
    }


    return {
      buildNodes: publicBuildNodes,
      buildLinks: publicBuildLinks,
    };

  }());

  module.exports = graphToD3;

}());

},{}],4:[function(require,module,exports){
var graphToD3 = require('./graph_to_d3');
var Graph = require('./graph').Graph;
var EulyCycler = require('./eulerian');


var startColor = 'steelblue';
var activeColor = 'tomato';
var visitedColor = 'DarkSeaGreen';
var delayBetween = 1000;
var circleRadius = 10;

var graphText = [
  '0 -> 1,1',
  '1 -> 2,2,4',
  '2 -> 3,3,5',
  '3 -> 0,0,2',
  '4 -> 1',
  '5 -> 3',
].join('\n');


var textBox = d3.select('#text_box');
textBox.text(graphText);

d3.select('#run_button').on("click", function() {
  d3.selectAll("circle").style("fill", startColor);
  d3.selectAll(".link").style("stroke", startColor);
  var text = document.getElementById('text_box').value;

  var graph = Graph.create(text);
  var cycler = EulyCycler.create(graph);
  cycler.eulerianCycle();
  var edgePaths = cycler.getAllEdgePaths();
  changeColorEdge(edgePaths, 0, 0);
});

function changeColorEdge(paths, pathIdx, edgeIdx) {
  var path = paths[pathIdx];
  var edge = path[edgeIdx];

  var fromName = edge.getFromNode().getName();
  var toName = edge.getToNode().getName();
  var id = fromName + '_' + toName + '_' + edge.getIndex();

  var selector = '#path_' + id;
  var arrow = d3.select(selector);

  var toNodeCircle = d3.select('#node_' + toName).select("circle");

  arrow
    .transition()
    .duration(400)
    .style("stroke", activeColor)
    .transition()
    .style("stroke", visitedColor);

  toNodeCircle
    .transition()
    .duration(400)
    .delay(400)
    .style("fill", activeColor)
    .transition()
    .style("fill", visitedColor);

  setTimeout(function() {
    var nextEdgeIdx = -1;
    var nextPathIdx = pathIdx;

    if (edgeIdx === path.length - 1) {
      nextEdgeIdx = 0;
      nextPathIdx = pathIdx + 1; 
      d3.selectAll(".link")
        .transition()
        .delay(200)
        .style("stroke", startColor);
      d3.selectAll("circle")
        .transition()
        .delay(200)
        .style("fill", startColor);
      if (nextPathIdx === paths.length) {
        return;
      }
    }
    else {
      nextEdgeIdx = edgeIdx + 1;
    }
    changeColorEdge(paths, nextPathIdx, nextEdgeIdx);
  }, delayBetween);
}


d3.select('#graph_button').on('click', doGraph);
    
function doGraph() {

  var text = document.getElementById('text_box').value;
  var graph = Graph.create(text);
  var nodes = graphToD3.buildNodes(graph.getNodes());
  var links = graphToD3.buildLinks(graph.getEdges(), graph.getNodes());

  var width = 960,
      height = 544;

  // Remove any prior graph
  d3.select(".mainSvg").remove();

  var svg = d3.select(".graph-wrapper").append("svg")
      .attr("class", "mainSvg")
      .attr("width", width)
      .attr("height", height)
      .call(d3.behavior.zoom().on("zoom", zoom))
    .append("g");

  svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
        .attr("d", "M0,-5L10,0L0,5Z");

  svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height);

  var force = d3.layout.force()
      .gravity(0.1)
      .distance(50)
      .charge(-2000)
      .size([width, height])
      .nodes(nodes)
      .links(links)
      .start();

  force.on("tick", function(e) {
    link.attr("d", linkArc);
    node.attr("transform",
              function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });

  var drag = force.drag()
      .origin(function(d) { return d; })
      .on("dragstart", dragstarted)
      .on("drag", dragged)
      .on("dragend", dragended);




  var link = svg.selectAll(".link")
      .data(force.links())
    .enter().append("path")
      .attr("id", function(d,i) { return "path_" + d.id; })
      .attr("class", "link")
      .attr("marker-end", "url(#arrowhead)");

  var node = svg.selectAll(".node")
      .data(nodes)
    .enter().append("g")
      .attr("id", function(d,i) { return "node_" + d.name; })
      .attr("class", "node")
      .call(drag);

  node.append("circle")
      .style("fill", startColor)
      .attr("r", circleRadius);

  node.append("text")
      .attr("dx", circleRadius + 2)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });

  function zoom() {
    svg.attr(
      "transform",
      "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }
}


function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed("dragging", true);
}

function dragged(d) {
  d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
  d3.select(this).classed("dragging", false);
}

function linkArc(d) {
  if (d.curve_type == 'straight') {
    return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + 
      d.target.y;
  }
  else {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        // half of circle
        dr = Math.sqrt(dx * dx + dy * dy) / 2.0;
        var sf = 1 - d.curve_weight;
        dr /= sf;

    if (d.curve_type == 'left') {
      return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr +
        " 0 0,1 " + d.target.x + "," + d.target.y;
    }
    else if (d.curve_type == 'right') {
      return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr +
        " 0 0,0 " + d.target.x + "," + d.target.y;
    }
  }
}

doGraph();

},{"./eulerian":1,"./graph":2,"./graph_to_d3":3}]},{},[1,2,3,4]);
