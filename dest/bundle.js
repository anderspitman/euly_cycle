(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Graph = require('./graph').Graph;
var Node = require('./graph').Node;
var Edge = require('./graph').Edge;


var EulyCycler = function(graph) {
  this._graph = graph;
  this._visited = [];
  this._pathListeners = [];
};

EulyCycler.create = function(graph) {
  return new EulyCycler(graph);
};

EulyCycler.prototype.eulerianCycle = function() {
  var eulerianPath = [];
  var firstNodeInGraph = this._graph.getNodes()[0];
  var nextNodeWithOpenExit = firstNodeInGraph;

  while (true) {
    var path = this._walkUntilStuck(nextNodeWithOpenExit);
    var eulerianPath = this._mergePaths(eulerianPath, path);
    this._notifyPathListeners(eulerianPath);
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

EulyCycler.prototype.goTo = function(node) {
  var currentNode = this.getCurrentNode();
  this.setCurrentNode(node);
  var edge = Edge.create(currentNode, node);
  this._visit(edge);
  return edge;
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

},{"./graph":2}],2:[function(require,module,exports){
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
         this._toNode.equals(other._toNode);
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

Graph.prototype.getOutgoingEdges = function(fromNode) {
  var outlinks = this._graph[fromNode.getName()];

  edges = [];
  for (var i=0; i<outlinks.length; i++) {
    var outlink = outlinks[i];
    edge = new Edge(fromNode, new Node(outlink));
    edges.push(edge);
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
   idx = Object.keys(graph).indexOf(key);
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

},{}],3:[function(require,module,exports){

var graphToD3 = (function() {

  var graph = {};
  var links = [];

  function indexOf(name, arr) {
    for (var i=0; i<arr.length; i+=1) {
      if (name === arr[i].name) {
        return i;
      }
    }
    return -1;
  }

  function count(elem, arr) {
    var count = 0;
    for (var i=0; i<arr.length; i++) {
      if (arr[i] == elem) {
        count += 1;
      }
    }
    return count;
  }

  function build_count_key(edge) {
    return edge.source + '_to_' + edge.target;
  }

  function count_possible(count_key, edges) {
    var count = 0;
    for (var i=0; i<edges.length; i++) {
      key = build_count_key(edges[i]);
      if (count_key === key) {
        count += 1;
      }
    }
    return count;
  }

  function buildLinks() {
      counts = {}
      for (var i=0; i<graph.edges.length; i+=1) {
        edge = graph.edges[i];
        count_key = build_count_key(edge);
        if (!(count_key in counts)) {
          counts[count_key] = {
            'count': 0,
            'possible': count_possible(count_key, graph.edges)
          };
        }
        counts[count_key].count += 1;
        var curve_type = 'straight';
        var possible = counts[count_key].possible;
        var count_idx = counts[count_key].count - 1;
        var curve_weight = (1.0 / possible) * 
          ((counts[count_key].count + (counts[count_key].count % 2)) / 2);
        if (possible === 1 || ((possible % 2 != 0) && count_idx === possible-1)) {
          curve_type = 'straight';
        }
        else {
          if (count_idx % 2 == 0) {
            curve_type = 'left';
          }
          else {
            curve_type = 'right';
          }
        }
        links.push({
            'source': edge.source,
            'target': edge.target,
            'curve_type': curve_type,
            'curve_weight': curve_weight
        });
      }
    return links;
  }

  function addIfNew(name, graph) {
     idx = indexOf(name, graph.nodes);
     if (idx === -1) {
       graph.nodes.push({ "name": name});
       idx = graph.nodes.length-1;
     }
     return idx;
  }

  function publicFromText(text, nodeSep, edgeSep) {
    nodeSep = typeof nodeSep !== 'undefined' ? nodeSep : '->';
    edgeSep = typeof edgeSep !== 'undefined' ? edgeSep : ',';
    lines = text.split('\n');
    new_graph = { "nodes": [], "edges": [] }
    for (var i=0; i<lines.length; i++) {
      line = lines[i].split(nodeSep);
      node = line[0].trim();
      sourceIdx = addIfNew(node, new_graph);
      outlinks = line[1].split(edgeSep);
      for (var j=0; j<outlinks.length; j++) {
       outlinks[j] = outlinks[j].trim();
       targetIdx = addIfNew(outlinks[j], new_graph);
       new_graph.edges.push({ "source": sourceIdx, "target": targetIdx });
      }
    }
    setData(new_graph);
    buildLinks();
  };

  function setData(new_graph) {
    graph = new_graph;
    buildLinks();
  }

  function publicGetNodes() {
    return graph.nodes;
  }

  function publicGetLinks() {
    return links;
  }

  return {
    getNodes: publicGetNodes,
    getLinks: publicGetLinks,
    setFromText: publicFromText
  }

}());

module.exports = graphToD3;

},{}],4:[function(require,module,exports){
var graphToD3 = require('./graph_to_d3');
var Graph = require('./graph').Graph;
var EulyCycler = require('./eulerian');


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

var textBox = d3.select('#text_box')
textBox.text(graphText);

d3.select('#run_button').on("click", function() {
  d3.selectAll("circle").style("fill", "blue");

  var graph = Graph.create(textBox.text());
  var cycler = EulyCycler.create(graph);
  var paths = cycler.eulerianCycleIntermediate();
  changeColor(paths, 0, 0);
});

function changeColor(paths, pathIdx, nodeIdx) {
  var path = paths[pathIdx];
  var node = path[nodeIdx];
  var selector = '#node_' + node.getName();
  var circles = d3.select(selector).select("circle");
  
  circles.style("fill", "green");
  setTimeout(function() {
    circles.style("fill", "grey")
  }, 200);

  setTimeout(function() {
    var nextNodeIdx = -1;
    var nextPathIdx = pathIdx;

    if (nodeIdx === path.length - 1) {
      nextNodeIdx = 0;
      nextPathIdx = pathIdx + 1; 
      if (nextPathIdx === paths.length) {
        return;
      }
    }
    else {
      nextNodeIdx = nodeIdx + 1;
    }
    changeColor(paths, nextPathIdx, nextNodeIdx);
  }, 200);
}


d3.select('#graph_button').on('click', function() {

  var new_graph = graphToD3.setFromText(textBox.text());
  var nodes = graphToD3.getNodes();
  var links = graphToD3.getLinks();

  var width = 960,
      height = 544;

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
      .gravity(.05)
      .distance(200)
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
      .attr("id", function(d,i) { return "path"+i })
      .attr("class", "link")
      .attr("marker-end", "url(#arrowhead)");

  var node = svg.selectAll(".node")
      .data(nodes)
    .enter().append("g")
      .attr("id", function(d,i) { return "node_" + d.name })
      .attr("class", "node")
      .call(drag);

  node.append("circle")
      .style("fill", 'blue')
      .attr("r", 10);

  node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.name });

  function zoom() {
    svg.attr(
      "transform",
      "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")")
  }
});


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

},{"./eulerian":1,"./graph":2,"./graph_to_d3":3}]},{},[1,2,3,4]);
