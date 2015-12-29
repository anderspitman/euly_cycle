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

var textBox = d3.select('#text_box');
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
    circles.style("fill", "grey");
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
      .gravity(0.05)
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
      .attr("id", function(d,i) { return "path"+i; })
      .attr("class", "link")
      .attr("marker-end", "url(#arrowhead)");

  var node = svg.selectAll(".node")
      .data(nodes)
    .enter().append("g")
      .attr("id", function(d,i) { return "node_" + d.name; })
      .attr("class", "node")
      .call(drag);

  node.append("circle")
      .style("fill", 'blue')
      .attr("r", 10);

  node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });

  function zoom() {
    svg.attr(
      "transform",
      "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
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
