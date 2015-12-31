(function() {
  "use strict";

  var graphToD3 = (function() {

    function publicBuildLinks(graphEdges, graphNodes) {
      var counts = {};
      var links = [];
      for (var i=0; i<graphEdges.length; i+=1) {
        var edge = graphEdges[i];
        var countKey = buildCountKey(edge);
        if (!(countKey in counts)) {
          counts[countKey] = {
            'count': 0,
            'possible': countPossible(countKey, graphEdges)
          };
        }
        counts[countKey].count += 1;
        var curveType = 'straight';
        var possible = counts[countKey].possible;
        var countIdx = counts[countKey].count - 1;
        var curveWeight = (1.0 / possible) * 
          ((counts[countKey].count + (counts[countKey].count % 2)) / 2);
        if (possible === 1 || ((possible % 2 !== 0) && countIdx === possible-1)) {
          curveType = 'straight';
        }
        else {
          if (countIdx % 2 === 0) {
            curveType = 'left';
          }
          else {
            curveType = 'right';
          }
        }
        links.push({
            'source': indexOfNode(edge.getFromNode(), graphNodes),
            'target': indexOfNode(edge.getToNode(), graphNodes),
            'curve_type': curveType,
            'curve_weight': curveWeight
        });
      }
      return links;
    }

    function buildCountKey(edge) {
      var countKey = edge.getFromNode().getName() + '_to_' + 
        edge.getToNode().getName();
      return countKey;
    }

    function countPossible(countKey, edges) {
      var count = 0;
      for (var i=0; i<edges.length; i++) {
        var key = buildCountKey(edges[i]);
        if (countKey === key) {
          count += 1;
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
