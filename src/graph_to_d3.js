(function() {
  "use strict";

  var graphToD3 = (function() {

    function publicBuildLinks(graphEdges, graphNodes) {
      var links = [];
      for (var i=0; i<graphEdges.length; i+=1) {
        var edge = graphEdges[i];
        var duplicateEdgesCount = countDuplicateEdges(edge, graphEdges);

        var curveType = determineCurveType(duplicateEdgesCount, edge.getId());
        var curveWeight = computeCurveWeight(duplicateEdgesCount,
                                             edge.getId());
        
        var fromName = edge.getFromNode().getName();
        var toName = edge.getToNode().getName();
        var id = fromName + '_' + toName + '_' + edge.getId();

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
