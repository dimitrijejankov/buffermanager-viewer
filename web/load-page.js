// this is initalizing our environment
function loadMe() {
    
    var fileInput = document.getElementById('browseOpen');
    var fReader = new FileReader();
    
    google.charts.load('current', {'packages':['treemap']});
    //google.charts.setOnLoadCallback(drawChart);

    function drawMemory(timeline, i) {

        var arrayData = [['Page', 'Parent', 'Size', 'Used'],
                         ['Memory', null, Number(timeline.numberOfPages * timeline.pageSize), null]];

        // the snapshot we want to show
        var snapshot = timeline.snapshots[i];

        // just to keep track of the full pages not used
        var usedPages = new Set();

        // 
        var subpages = {"usedPages" : {}, "partitions" : {}};

        // init all the main pages
        for (var j = 0; j < snapshot.activePages.length; ++j) {

            // the number of the physical page
            var pageNumber = snapshot.activePages[j].pageOffset / timeline.pageSize;

            // if this is a large page it has only the page number appended for example Page 1 or Page 2
            if(snapshot.activePages[j].pageSize == timeline.pageSize) {

                // add the used number
                usedPages.add(Number(pageNumber));

                // add the page
                arrayData.push(['Page ' + pageNumber, 'Memory', Number(snapshot.activePages[j].pageSize), -1]);
            }
            else {

                // figure out the subpage number
                var subpageNumber = (snapshot.activePages[j].pageOffset % timeline.pageSize) / snapshot.activePages[j].pageSize;

                // set the partitions
                subpages.partitions[pageNumber] = timeline.pageSize / snapshot.activePages[j].pageSize;

                // set the used pages
                if(!(pageNumber in subpages.usedPages)) {
                    subpages.usedPages[pageNumber] = new Set();
                }

                // add the subpage
                subpages.usedPages[pageNumber].add(Number(subpageNumber));

                // set the subpage number
                arrayData.push(['Page ' + pageNumber + "." + subpageNumber, 'Page ' + pageNumber, Number(snapshot.activePages[j].pageSize), -1]);
            }
        }

        // init all the free pages
        for (var j = 0; j < snapshot.freePages.length; ++j) {

            // the number of the physical page
            var pageNumber = snapshot.freePages[j].pageOffset / timeline.pageSize;

            // if this is a large page it has only the page number appended for example Page 1 or Page 2
            if(snapshot.freePages[j].pageSize == timeline.pageSize) {

                // add the used number
                usedPages.add(Number(pageNumber));

                // add the page
                arrayData.push(['Page ' + pageNumber, 'Memory', Number(snapshot.freePages[j].pageSize), 1]);
            }
            else {

                // figure out the subpage number
                var subpageNumber = (snapshot.freePages[j].pageOffset % timeline.pageSize) / snapshot.freePages[j].pageSize;

                // set the partitions
                subpages.partitions[pageNumber] = timeline.pageSize / snapshot.freePages[j].pageSize;

                // set the used pages
                if(!(pageNumber in subpages.usedPages)) {
                    subpages.usedPages[pageNumber] = new Set();
                }

                // add the subpage
                subpages.usedPages[pageNumber].add(Number(subpageNumber));

                // set the subpage number
                arrayData.push(['Page ' + pageNumber + "." + subpageNumber, 'Page ' + pageNumber, Number(snapshot.freePages[j].pageSize), 1]);
            }
        }

        // add the missing large pages (since they have been partitioned)
        for(var j = 0; j < timeline.numberOfPages; ++j) {
            
            // if we don't have the page
            if(!usedPages.has(j)) {
                arrayData.push(['Page ' + j, 'Memory', Number(timeline.pageSize), 1]);
            }
        }

        // add the missing mini pages (since they may be used by some thread but are not leaded)
        for(var page in subpages.partitions) {

            // go thrugh each minipage page that we haven't created and create it
            for(var j = 0; j < subpages.partitions[page]; ++j) {

                // check if we have it
                if(!subpages.usedPages[page].has(j)) {

                    // set the subpage number
                    arrayData.push(['Page ' + page + "." + j, 'Page ' + page, Number(timeline.pageSize / subpages.partitions[page]), 0]);
                }
            }
        }

        var data = google.visualization.arrayToDataTable(arrayData);

        tree = new google.visualization.TreeMap(document.getElementById('chart_div'));

        var options = { highlightOnMouseOver: true,
                        maxDepth: 1,
                        maxPostDepth: 2,
                        headerHeight: 15,
                        height: 500,
                        useWeightedAverageForAggregation: true };

        tree.draw(data, options);
    }

    fReader.onload = function(e) {

        // grab the byte array
        var byteArray = e.target.result

        // parse the timeline
        var timeline = parseTimeline(byteArray);

        // finished parsing
        console.log("Finished parsing");

        // render 1
        drawMemory(timeline, 15);
    }
    
    fileInput.onchange = function(e) {
        var file = this.files[0];
        fReader.readAsArrayBuffer(file);
    }
}
window.onload=loadMe;