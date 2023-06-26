var Airtable = require('airtable');

var base = null
var textSize = 5;
var events = [];
var firstLoad = true;

function displayTime(timeInSec) {
    const sec = (Math.floor(timeInSec) % 60)
    const rest = Math.floor(timeInSec / 60)
    const min = rest % 60
    const hour = Math.floor(rest / 60)
    return  (hour < 10 ? '0' : '') + hour + ':' + (min < 10 ? '0': '') + min + ':' + (sec < 10 ? '0' : '') + sec;
}

function arraySortFunction(a, b)
{
    if (a.deltaInS < b.deltaInS)
        return -1;
    if (a.deltaInS > b.deltaInS)
        return 1;
    return 0;
}

function displayEvents() {
    console.log("DISPLAY :" + events.length)

    document.getElementById('spinner').style.display = 'none'
    var now = new Date();
    var toDisplay = []
    for (var i = 0; i < events.length; ++i) {
        const date = new Date(events[i].date)
        if (date > now) {
            toDisplay.push({ "deltaInS": Math.floor((date - now) / 1000), "content": events[i].content, "time": date.toLocaleString()})
        }
    }
    // Sort array and keep maximum 5 elements to display
    toDisplay.sort(arraySortFunction);
    if (toDisplay.length > 5) {
        toDisplay.length = 5
    }
    var content = "";
    content = '<table class="table table-striped" style="font-size: ' + textSize + 'vw;"><thead><tr><th scope="col">Time</th><th scope="col">Remaining</th><th>Event</th></tr></thead><tbody>';
    for (var i = 0; i < toDisplay.length; ++i) {
        content += '<tr><td>' + toDisplay[i].time + '</td><td>' + displayTime(toDisplay[i].deltaInS) + "</td>";
        content += '<td>' + toDisplay[i].content + '</td></tr>';
        //console.log(toDisplay[i].deltaInS + " " + toDisplay[i].content)
    }
    content += '</tbody></table>';
    document.getElementById('content').innerHTML = content
    window.setTimeout(displayEvents,1000); /* recall in 2s */
}

function reloadData() {
  console.log("LOAD DATA")
  newEvents = [];
  base('Main').select({maxRecords: 5000, view: "Grid view"}).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.
    records.forEach(function(record) {
        newEvents.push({ "date": record.get("Date"), "content": record.get("Content")})
     });
     // To fetch the next page of records, call `fetchNextPage`.
     // If there are more records, `page` will get called again.
     // If there are no more records, `done` will get called.
     fetchNextPage();
  }, function done(err) {
    // Checl if there is any error while fetching airtable content
    if (err) {
        console.error(err);
    } else {
        events = newEvents
    }
    setTimeout(reloadData, 60000); /* recall in 1minute */
    if (firstLoad)
        displayEvents();
    firstLoad = false;
  });
}

document.addEventListener('DOMContentLoaded', function () {
    base = new Airtable({ apiKey: 'patHSL6ZkPWx8Rkva.f0b8c1970c1cd8b5926d04eaf59d9fd500a39738c73bbb3a471f4f7eb3561ec0' }).base('appiiuioD2YBj4Da6');

   reloadData();
   document.getElementById('1TConfig').onclick = function() {
        document.getElementById('1TConfig').className = "dropdown-item active";
        document.getElementById('2TConfig').className = "dropdown-item ";
        document.getElementById('3TConfig').className = "dropdown-item ";
        document.getElementById('4TConfig').className = "dropdown-item";
        document.getElementById('5TConfig').className = "dropdown-item";
       textSize = 1;
   }
    document.getElementById('2TConfig').onclick = function() {
        document.getElementById('1TConfig').className = "dropdown-item ";
        document.getElementById('2TConfig').className = "dropdown-item active";
        document.getElementById('3TConfig').className = "dropdown-item ";
        document.getElementById('4TConfig').className = "dropdown-item";
        document.getElementById('5TConfig').className = "dropdown-item";
        textSize = 2;
    }
    document.getElementById('3TConfig').onclick = function() {
        document.getElementById('1TConfig').className = "dropdown-item ";
        document.getElementById('2TConfig').className = "dropdown-item ";
        document.getElementById('3TConfig').className = "dropdown-item active";
        document.getElementById('4TConfig').className = "dropdown-item";
        document.getElementById('5TConfig').className = "dropdown-item";
        textSize = 3;
    }
    document.getElementById('4TConfig').onclick = function() {
        document.getElementById('1TConfig').className = "dropdown-item ";
        document.getElementById('2TConfig').className = "dropdown-item ";
        document.getElementById('3TConfig').className = "dropdown-item ";
        document.getElementById('4TConfig').className = "dropdown-item active";
        document.getElementById('5TConfig').className = "dropdown-item";
        textSize = 4;
    }
    document.getElementById('5TConfig').onclick = function() {
        document.getElementById('1TConfig').className = "dropdown-item ";
        document.getElementById('2TConfig').className = "dropdown-item ";
        document.getElementById('3TConfig').className = "dropdown-item ";
        document.getElementById('4TConfig').className = "dropdown-item";
        document.getElementById('5TConfig').className = "dropdown-item active";
        textSize = 5;
    }
});

