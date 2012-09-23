var chart;

$(document).ready(function () {
  chart = new Highcharts.StockChart({
    chart: {
      renderTo: 'container'
    },
    rangeSelector: {
      selected: 0,
      buttons: [{
        type: 'hour',
        count: 3,
        text: '3h'
      }, {
        type: 'day',
        count: 1,
        text: '1d'
      }, {
        type: 'month',
        count: 1,
        text: '1m'
      }, {
        type: 'ytd',
        text: 'YTD'
      }, {
        type: 'year',
        count: 1,
        text: '1y'
      }, {
        type: 'all',
        text: 'All'
      }]
    },
    yAxis: {
      title: {
        text: 'Reply in Seconds'
      }
    },
    xAxis: {
      title: {
        text: 'Date - Time'
      },
      type: 'datetime'
    },
    series: [{
      name: 'Search',
      data: []
    }]
  });

  chart.showLoading();

  var socket = io.connect('http://localhost');
  socket.on('init', function (data) {
    //chart.series[0].setData([])
    addPoints(data);
    chart.hideLoading();
  });

  socket.on('data', function (data) {
    addPoints([data]);
  });

});

function addPoints(data) {
  $.each(data, function (index, data) {
    var point = [
      Math.round(data.time * 1000),
      data.timeElapsed
    ]
    chart.series[0].addPoint(point, false);
  });
  
  chart.redraw()
}
