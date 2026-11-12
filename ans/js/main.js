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
function getHourFormatWithSeconds(date) {
    return getHourFormat(date) + ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
}

function displayEvents() {
    document.getElementById('spinner').style.display = 'none'
    const now = new Date();
    const nowSec = now.getTime() / 1000; // getTime() is in milliseconds
    
    var toDisplay = []
    for (var i = 0; i < events.length; ++i) {
        const date = new Date(events[i].date)
        const dateSec = date.getTime() / 1000 + events[i].hourOffset * 3600; // getTime is in milliseconds, offsetInHours
        if ((dateSec + events[i].length) > nowSec) { // remove finished events
            var dateString = ""
            if (sameDay(date, now))
                dateString = getHourFormat(date)
            else
                dateString = date.getDate() + '/' + (date.getMonth() + 1) + ' ' + getHourFormat(date);

            var delta = Math.floor(dateSec - nowSec)
            if (deltaToHours(delta) < maxHours) { // remove events too much in the future
               toDisplay.push({ "deltaInS": delta, "content": events[i].content, "time": dateString, "color": events[i].color ? events[i].color : "#FFFFFF"})
            }
        }
    }
    // Sort array and keep maximum 5 elements to display
    toDisplay.sort(arraySortFunction);
    if (toDisplay.length > 5) {
        toDisplay.length = 5
    }
    const date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'long', timeZone: 'Europe/Paris' }).format(new Date())

    var content = '';
    // Display past events that are still happening
    var nbPastEvent = 0;
    // Display future events
    for (var i = 0; i < toDisplay.length && toDisplay[i].deltaInS < 0; ++i) {
        ++nbPastEvent;
        content += '<div style="color:' + toDisplay[i].color + ' ;font-size:2vw; text-align: center;">Current: ' + toDisplay[i].content + ' --- ' +  toDisplay[i].time + '</div>';
    }
    
    // Display date of the day
    content += '<div style="color:yellow; font-size:' + (textSize - 1) + 'vw; text-align: center;">' + date + '</div>';
    // Display the next main event
    if (toDisplay.length > nbPastEvent) {
        content += '<div style="color:' + toDisplay[i].color + ';padding-top:5%;font-size:' + (textSize + 2) + 'vw; text-align: center;">' + toDisplay[nbPastEvent].content + '</div>';
        content += '<div style="color:'  + toDisplay[i].color + ';padding-top:1%;padding-bottom:5%;font-size:' + (textSize + 4) + 'vw; text-align: center;">' + displayTime(toDisplay[nbPastEvent].deltaInS) + '</div>';
    }
    // Display future events
    for (var i = nbPastEvent + 1; i < toDisplay.length; ++i) {
        content += '<div style="color:' + toDisplay[i].color + ';font-size:2vw; text-align: center;">Next: ' + toDisplay[i].content + ' --- ' +  displayTime(toDisplay[i].deltaInS) + '</div>';
    }
    document.getElementById('content').innerHTML = content
    window.setTimeout(displayEvents,1000); /* recall in 2s */
}

function reloadData() {
  newEvents = [];
  base('Main').select({maxRecords: 5000, view: "Grid view"}).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.
      records.forEach(function(record) {
          newEvents.push({ "date": record.get("Date"), "hourOffset": record.get("HourOffset"), "content": record.get("Content"), "color": record.get("Color"), "length": record.get("Length")})
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
function setLabelActive(name, start, end, element) {
    for (var i = start; i < (end + 1); ++i) {
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
    document.getElementById('2TConfig').onclick = function() {
        setLabelActive('TConfig', 2, 5, 2);
        textSize = 2;
    }
    document.getElementById('3TConfig').onclick = function() {
        setLabelActive('TConfig', 2, 5, 3);
        textSize = 3;
    }
    document.getElementById('4TConfig').onclick = function() {
        setLabelActive('TConfig', 2, 5, 4);
        textSize = 4;
    }
    document.getElementById('5TConfig').onclick = function() {
        setLabelActive('TConfig', 2, 5, 5);
        textSize = 5;
    }
    document.getElementById('1DConfig').onclick = function() {
        setLabelActive('DConfig', 1, 5, 1);
        maxHours = 24;
    }
     document.getElementById('2DConfig').onclick = function() {
         setLabelActive('DConfig', 1, 5, 2);
         maxHours = 48;
     }
     document.getElementById('3DConfig').onclick = function() {
         setLabelActive('DConfig', 1, 5, 3);
         maxHours = 72;
     }
     document.getElementById('4DConfig').onclick = function() {
         setLabelActive('DConfig', 1, 5, 4);
         maxHours = 96;
     }
     document.getElementById('5DConfig').onclick = function() {
         setLabelActive('DConfig', 1, 5, 5);
         maxHours = 120;
     }
});

