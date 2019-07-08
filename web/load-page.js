// this is initalizing our environment
function loadMe() {

    var timeline;
    var timelinePoints = [];
    var fileInput = document.getElementById('browseOpen');
    var fReader = new FileReader();
    
    google.charts.load('current', {'packages':['treemap']});

    fReader.onload = function(e) {

        // grab the byte array
        var byteArray = e.target.result

        // parse the timeline
        timeline = parseTimeline(byteArray);

        // finished parsing
        console.log("Finished parsing");

        // draw the chart
        drawChart(timeline);

        // hide the file chooser
        $("#browseOpen").hide();
    }
    
    fileInput.onchange = function(e) {
        var file = this.files[0];
        fReader.readAsArrayBuffer(file);
    }

    google.charts.load("current", {packages:["timeline"]});
    
    function drawChart(tl) {

        // the current timepoint
        var currentTimepoint = 0;

        // figure out the timeline points
        timelinePoints = [];
        for(var t in timeline.snapshots) {
          timelinePoints.push(t);
        }
        timelinePoints.sort(function(a, b){return a-b});

        // render the first map
        drawMemory(timeline, timelinePoints[currentTimepoint]);

        var replacementSwitch = $("#timeline-select" )
        for(t in timelinePoints) {
            replacementSwitch.append($('<option value="' + timelinePoints[t] +'">Snapshot ' + timelinePoints[t] + '</option>'))
        }
        
        replacementSwitch.show();
        replacementSwitch.chosen({}).change( function(obj, result) {
            drawMemory(timeline, result.selected);
        });

        $("#button-first").click(function(){

            // set it to the first
            currentTimepoint = 0;

            // update ui
            replacementSwitch.val(timelinePoints[currentTimepoint]);
            replacementSwitch.trigger("chosen:updated");
            drawMemory(timeline, timelinePoints[currentTimepoint]);
        }); 

        $("#button-next").click(function(){

            // go to the next one
            currentTimepoint += 1;
            if(currentTimepoint >= timelinePoints.length) { currentTimepoint = timelinePoints.length - 1; }

            // update ui
            replacementSwitch.val(timelinePoints[currentTimepoint]);
            replacementSwitch.trigger("chosen:updated");
            drawMemory(timeline, timelinePoints[currentTimepoint]);
        }); 

        $("#button-previous").click(function(){

            // go to the previous one
            currentTimepoint -= 1;
            if(currentTimepoint < 0) { currentTimepoint = 0; }

            // update ui
            replacementSwitch.val(timelinePoints[currentTimepoint]);
            replacementSwitch.trigger("chosen:updated");
            drawMemory(timeline, timelinePoints[currentTimepoint]);
        }); 

        $("#button-last").click(function(){

            // go to the last one go to the previous one
            currentTimepoint = timelinePoints.length - 1;

            // update ui
            replacementSwitch.val(timelinePoints[currentTimepoint]);
            replacementSwitch.trigger("chosen:updated");
            drawMemory(timeline, timelinePoints[currentTimepoint]);
        }); 
    }
}
window.onload=loadMe;