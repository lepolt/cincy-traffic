
function getRouteTrend(crossroadName, directionText) {
  var minutes = $('#minutes').val();

  $.ajax({
    type: 'get',
    url: '/routes/trend',
    data: {
      crossroadName: crossroadName,
      directionText: directionText,
      minutes: minutes
    }
  });
}