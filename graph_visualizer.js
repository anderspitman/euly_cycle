
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

var btn = document.querySelector("#graph_button");
btn.addEventListener("click", function() {

  new_graph = graphModule.fromText(textBox.value);
  graphModule.setData(new_graph);
  var nodes = graphModule.getNodes();
  var links = graphModule.getLinks();

  force
      .nodes(nodes)
      .links(links)
      .start();

  var link = svg.selectAll(".link")
      .data(force.links())
    .enter().append("path")
      .attr("id", function(d,i) { return "path"+i })
      .attr("class", "link")
      .attr("marker-end", "url(#arrowhead)");

  svg.selectAll(".link").append("text")
      .append("textPath")
      .attr("xlink:href", function(d,i) { return "#path"+i })
      .text("hi there");

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
