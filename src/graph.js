var Node = function(name) {
  this._name = name;
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