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
