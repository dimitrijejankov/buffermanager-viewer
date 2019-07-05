google.charts.load('current', {'packages':['treemap']});
google.charts.setOnLoadCallback(drawChart);
function drawChart() {
  var data = google.visualization.arrayToDataTable([
    ['Page', 'Parent', 'Size', 'Used'],
    ['Memory',    null,                 2, null],
    ['Page 0',   'Memory',             2, 0],
    ['Page 1',   'Memory',            2, 0],
    ['Page 3',   'Memory',            2, 0],
    ['Page 4',   'Memory',            2, 0],
    ['Page 5',   'Memory',            2, 0],
    ['Page 0.0', 'Page 0',            1, 1],
    ['Page 0.1', 'Page 0',            1, 1]
  ]);

  tree = new google.visualization.TreeMap(document.getElementById('chart_div'));

var options = {
  highlightOnMouseOver: true,
  maxDepth: 1,
  maxPostDepth: 2,
  headerHeight: 15,
  height: 500,
  useWeightedAverageForAggregation: true
};

  tree.draw(data, options);

}