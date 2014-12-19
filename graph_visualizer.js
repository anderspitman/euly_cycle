
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
  
  function publicBuild(text, nodeSep, edgeSep) {
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
    buildFromText: publicBuild
  }

}());

function zoom() {
  svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")")
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

var toggleColor = (function(){
   var currentColor = "steelblue";

    return function(){
        currentColor = currentColor == "steelblue" ? "tomato" : "steelblue";
        d3.select(this).style("fill", currentColor);
    }
})();

var width = 960,
    height = 544

var svg = d3.select(".graph-wrapper").append("svg")
    .attr("class", "mainSvg")
    .attr("width", width)
    .attr("height", height)
    .attr("height", height)
    .call(d3.behavior.zoom().on("zoom", zoom))
  .append("g");

svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 20)
    .attr("refY", 0)
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    .attr("orient", "auto")
    .append("path")
        .attr("d", "M0,-5L10,0L0,5Z");

svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .gravity(.05)
    .distance(50)
    .charge(-1000)
    .size([width, height]);

var drag = force.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

var default_graph_text = [
  '(AC AT) -> (CC TA), (CT TT)',
  '(AT TG) -> (TA GA), (TT GA)',
  '(CA GA) -> (AC AT)',
  '(CC TA) -> (CG AC)',
  '(CG AC) -> (GA CT)',
  '(CT AG) -> (TG GC)',
  '(CT TT) -> (TG TC)',
  '(GA CT) -> (AA TT), (AT TG), (AT TG)',
  '(TA GA) -> (AC AT)',
  '(TC AA) -> (CT AG)',
  '(TG GC) -> (GA CT)',
  '(TG TC) -> (GA CT)',
  '(TT GA) -> (TC AA)',
  '(AA TT) -> (CA GA)'
].join('\n');

var textBox = document.querySelector("#text_box");
textBox.value = default_graph_text;

//var btn = document.querySelector("#graph_button");
//btn.addEventListener("click", function() {
d3.json("graph.json", function(error, json) {
  if (error) {
    console.log(error);
  }
 
  new_graph = graphModule.buildFromText(textBox.value);

  graphModule.setData(new_graph);
  //graphModule.setData(json);
  var nodes = graphModule.getNodes();
  var links = graphModule.getLinks();

  force
      .nodes(nodes)
      .links(links)
      .start();

  var link = svg.selectAll(".link")
      .data(force.links())
    .enter().append("path")
      .attr("class", "link")
      .attr("marker-end", "url(#arrowhead)");

  var node = svg.selectAll(".node")
      .data(nodes)
    .enter().append("g")
      .attr("class", "node")
      //.call(force.drag);
      .call(drag);

  function setColor(d) {
    if (d.have_outlinks) {
      return 'steelblue';
    }
    else {
      return 'tomato';
    }
  }

  function linkArc(d) {
    if (d.curve_type == 'straight') {
      return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
    }
    else {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          // half of circle
          dr = Math.sqrt(dx * dx + dy * dy) / 2.0;
          var sf = 1 - d.curve_weight;
          dr /= sf;

      if (d.curve_type == 'left') {
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
      }
      else if (d.curve_type == 'right') {
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,0 " + d.target.x + "," + d.target.y;
      }
    }
  }

  node.append("circle")
      .style("fill", setColor)
      .attr("r", 10)
      .on("click", toggleColor);

  node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.name });

  force.on("tick", function(e) {
    link.attr("d", linkArc);
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
});
//});

