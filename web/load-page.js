// this is initalizing our environment
function loadMe() {

    var timeline;
    var timelinePoints = [];
    var symbols = null;
    var backendSymbols = null;
    var traces = null;
    var backendTraces = null;

    google.charts.load('current', {'packages':['treemap']});

    // init the timeline file loading
    var timelineFileInput = document.getElementById('openTimeline');
    var timeLineReader = new FileReader();
    timeLineReader.onload = function(e) {

        // grab the byte array
        var byteArray = e.target.result

        // parse the timeline
        timeline = parseTimeline(byteArray);

        // finished parsing
        console.log("Timeline parsing finished");

        // draw the chart
        drawChart(timeline);

        // hide the file chooser
        $("#openTimelineGroup").hide();
        $("#openSymbolsGroup").show();
    }
    
    timelineFileInput.onchange = function(e) {
        var file = this.files[0];
        timeLineReader.readAsArrayBuffer(file);
    }

    // init the symbol file loading
    var symbolsFileInput = document.getElementById('openSymbols');
    var symbolsReader = new FileReader();
    symbolsReader.onload = function(e) {

        // grab the byte array
        var byteArray = e.target.result

        // parse the symbols
        symbols = parseSymbols(byteArray);

        // finished parsing
        console.log("Symbols parsing finished");

        // hide the file chooser
        $("#openSymbolsGroup").hide();
        $("#openStackTracesGroup").show();
    }

    symbolsFileInput.onchange = function(e) {
        var file = this.files[0];
        symbolsReader.readAsArrayBuffer(file);
    }

    // init the traces
    var tracesFileInput = document.getElementById('openStackTraces');
    var tracesReader = new FileReader();
    tracesReader.onload = function(e) {

        // grab the byte array
        var byteArray = e.target.result

        // load the traces
        traces = parseTraces(byteArray);

        // finished parsing
        console.log("Traces parsing finished");

        // hide the file chooser
        $("#openStackTracesGroup").hide();
        $("#openBackendSymbolsGroup").show();
    }

    tracesFileInput.onchange = function(e) {
        var file = this.files[0];
        tracesReader.readAsArrayBuffer(file);
    }

    // init the symbol file loading
    var symbolsBackendFileInput = document.getElementById('openBackendSymbols');
    var symbolsBackendReader = new FileReader();
    symbolsBackendReader.onload = function(e) {

        // grab the byte array
        var byteArray = e.target.result

        // parse the symbols
        backendSymbols = parseSymbols(byteArray);

        // finished parsing
        console.log("Backend symbols parsing finished");

        // hide the file chooser
        $("#openBackendSymbolsGroup").hide();
        $("#openBackendStackTracesGroup").show();
    }

    symbolsBackendFileInput.onchange = function(e) {
        var file = this.files[0];
        symbolsBackendReader.readAsArrayBuffer(file);
    }

    // init the traces
    var tracesBackendFileInput = document.getElementById('openBackendStackTraces');
    var tracesBackendReader = new FileReader();
    tracesBackendReader.onload = function(e) {

        // grab the byte array
        var byteArray = e.target.result

        // load the traces
        backendTraces = parseBackendTraces(byteArray);

        // finished parsing
        console.log("Backend traces parsing finished");

        // hide the file chooser
        $("#openBackendStackTracesGroup").hide();
    }

    tracesBackendFileInput.onchange = function(e) {
        var file = this.files[0];
        tracesBackendReader.readAsArrayBuffer(file);
    }
    
    google.charts.load("current", { packages:["timeline"] });
    
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
        drawMemory(timeline, symbols, traces, backendSymbols, backendTraces, timelinePoints[currentTimepoint]);

        var replacementSwitch = $("#timeline-select" )
        for(t in timelinePoints) {
            replacementSwitch.append($('<option value="' + t +'">Snapshot ' + timelinePoints[t] + '</option>'));
        }
        
        replacementSwitch.show();
        replacementSwitch.chosen({}).change( function(obj, result) {

            // set the timepoint
            currentTimepoint = Number(result.selected);

            // update ui
            drawMemory(timeline, symbols, traces, backendSymbols, backendTraces, timelinePoints[currentTimepoint]);
        });

        $("#button-first").click(function(){

            // set it to the first
            currentTimepoint = 0;

            // update ui
            replacementSwitch.val(timelinePoints[currentTimepoint]);
            replacementSwitch.trigger("chosen:updated");
            drawMemory(timeline, symbols, traces, backendSymbols, backendTraces, timelinePoints[currentTimepoint]);
        }); 

        $("#button-next").click(function(){

            // go to the next one
            currentTimepoint += 1;
            if(currentTimepoint >= timelinePoints.length) { currentTimepoint = timelinePoints.length - 1; }

            // update ui
            replacementSwitch.val(timelinePoints[currentTimepoint]);
            replacementSwitch.trigger("chosen:updated");
            drawMemory(timeline, symbols, traces, backendSymbols, backendTraces, timelinePoints[currentTimepoint]);
        }); 

        $("#button-previous").click(function(){

            // go to the previous one
            currentTimepoint -= 1;
            if(currentTimepoint < 0) { currentTimepoint = 0; }

            // update ui
            replacementSwitch.val(timelinePoints[currentTimepoint]);
            replacementSwitch.trigger("chosen:updated");
            drawMemory(timeline, symbols, traces, backendSymbols, backendTraces, timelinePoints[currentTimepoint]);
        }); 

        $("#button-last").click(function(){

            // go to the last one go to the previous one
            currentTimepoint = timelinePoints.length - 1;

            // update ui
            replacementSwitch.val(timelinePoints[currentTimepoint]);
            replacementSwitch.trigger("chosen:updated");
            drawMemory(timeline, symbols, traces, backendSymbols, backendTraces, timelinePoints[currentTimepoint]);
        }); 
    }
}
window.onload=loadMe;