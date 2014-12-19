
var graphModule = (function() {

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

  function publicFromTextWeighted(text, nodeSep) {
    nodeSep = typeof nodeSep !== 'undefined' ? nodeSep : '->';
    lines = text.split('\n');
    new_graph = { "nodes": [], "edges": [] }
    for (var i=0; i<lines.length; i++) {
      line = lines[i].split(nodeSep);
      source = line[0].trim();
      target = line[1].trim().slice(0, line[1].indexOf(':'));
      sourceIdx = addIfNew(source, new_graph);
      targetIdx = addIfNew(target, new_graph);
      new_graph.edges.push({ "source": sourceIdx, "target": targetIdx });
    }
    return new_graph;
  };
  
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
    return new_graph;
  };

  function publicSetData(new_graph) {
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
    setData: publicSetData,
    getNodes: publicGetNodes,
    getLinks: publicGetLinks,
    fromText: publicFromText,
    fromTextWeighted: publicFromTextWeighted
  }

}());

module.exports = graphModule;
