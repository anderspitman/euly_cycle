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
    this._id = 0;
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
           this._id === other._id;
  };

  Edge.prototype.setId = function(id) {
    this._id = id;
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
        edge.setId(id);
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
