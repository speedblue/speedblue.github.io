var Airtable = require('airtable');

var base = null
var textSize = 5;
var maxHours = 120;
var events = [];
var firstLoad = true;

function deltaToHours(timeInSec) {
    return timeInSec / 3600
}
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

function sameDay(day1, day2) {
    return day1.getFullYear() == day2.getFullYear() && day1.getDate() == day2.getDate()
}
function getHourFormat(date) {
    return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
}
function displayEvents() {
    console.log("DISPLAY :" + events.length)

    document.getElementById('spinner').style.display = 'none'
    var now = new Date();
    var toDisplay = []
    for (var i = 0; i < events.length; ++i) {
        const date = new Date(events[i].date)
        if (date > now) { // remove past events
            var delta = Math.floor((date - now) / 1000)
            if (deltaToHours(delta) < maxHours) { // remove events too much in the future
                var dateString = ""
                if (sameDay(date, now))
                    dateString = getHourFormat(date)
                else
                    dateString = date.getDate() + '/' + (date.getMonth() + 1) + ' ' + getHourFormat(date);
                toDisplay.push({ "deltaInS": delta, "content": events[i].content, "time": dateString})
            }
        }
    }
    // Sort array and keep maximum 5 elements to display
    toDisplay.sort(arraySortFunction);
    if (toDisplay.length > 5) {
        toDisplay.length = 5
    }
    var content = "";
    content = '<table class="table table-striped" style="font-size: ' + textSize + 'vw; text-align: center;"><thead><tr><th scope="col" style="padding-top: 0;">Time</th><th scope="col" style="padding-top: 0;">Countdown</th><th style="padding-top: 0;">Event</th></tr></thead><tbody>';
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
function setLabelActive(name, element) {
    for (var i = 1; i < 6; ++i) {
        var component = i + name;
        if (i == element)
            document.getElementById(component).className = "dropdown-item active";
        else
            document.getElementById(component).className = "dropdown-item";
    }
}

document.addEventListener('DOMContentLoaded', function () {
   base = new Airtable({ apiKey: 'patHSL6ZkPWx8Rkva.f0b8c1970c1cd8b5926d04eaf59d9fd500a39738c73bbb3a471f4f7eb3561ec0' }).base('appiiuioD2YBj4Da6');
   reloadData();
   document.getElementById('1TConfig').onclick = function() {
       setLabelActive('TConfig', 1);
       textSize = 1;
   }
    document.getElementById('2TConfig').onclick = function() {
        setLabelActive('TConfig', 2);
        textSize = 2;
    }
    document.getElementById('3TConfig').onclick = function() {
        setLabelActive('TConfig', 3);
        textSize = 3;
    }
    document.getElementById('4TConfig').onclick = function() {
        setLabelActive('TConfig', 4);
        textSize = 4;
    }
    document.getElementById('5TConfig').onclick = function() {
        setLabelActive('TConfig', 5);
        textSize = 5;
    }
    document.getElementById('1DConfig').onclick = function() {
        setLabelActive('DConfig', 1);
        maxHours = 24;
    }
     document.getElementById('2DConfig').onclick = function() {
         setLabelActive('DConfig', 2);
         maxHours = 48;
     }
     document.getElementById('3DConfig').onclick = function() {
         setLabelActive('DConfig', 3);
         maxHours = 72;
     }
     document.getElementById('4DConfig').onclick = function() {
         setLabelActive('DConfig', 4);
         maxHours = 96;
     }
     document.getElementById('5DConfig').onclick = function() {
         setLabelActive('DConfig', 5);
         maxHours = 120;
     }
});

