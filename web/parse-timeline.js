
// conversion method
function bin2String (array, offset, size) {
    var result = "";
    for (var i = 0; i < size; i++) {
        result += String.fromCharCode(array.getInt8(offset + i));
    }
    return result;
}

function parseTimeline(byteArray) {

    // byte array
    var byteView = new DataView(byteArray)

    // the offset
    var byteOffset = 0

    // check the magic number
    var magicNumber = byteView.getBigUint64(byteOffset, true);
    if(magicNumber != 10202026){
        alert("This is not a timeline file");
    }
    
    // get the number of pages
    var numberOfPages = byteView.getBigUint64(byteOffset + 8, true);

    // get the page size
    var pageSize = byteView.getBigUint64(byteOffset + 16, true);

    // skip the first three numbers
    byteOffset += 3 * 8

    var timeline = { "pageSize" : pageSize, "numberOfPages" : numberOfPages, "snapshots" : {} };

    while(byteView.byteLength != byteOffset) {
        
        // the snapshot object we are going to fill up
        var snapshot = { "activePages" : [] , "freePages" : [] };

        // get the tick of the snapshot
        var tick = byteView.getBigUint64(byteOffset, true);

        // get the number of pages
        var activePages = byteView.getBigUint64(byteOffset + 8, true);

        // remove the last two ints
        byteOffset += 2 * 8

        // preallocate the pages
        snapshot["activePages"] = new Array(Number(activePages));

        // get all the pages
        var i;
        for (i = 0; i < activePages; i++) {

            // read in the size of the database name
            var dbNameSize = byteView.getBigUint64(byteOffset, true);
            byteOffset += 8;
            
            // read in a string (this is actually very painful to see so inefficient)
            var dbName = bin2String(byteView, byteOffset, dbNameSize);
            byteOffset += Number(dbNameSize);

            // read in the size of the database name
            var setNameSize = byteView.getBigUint64(byteOffset, true);
            byteOffset += Number(8);
            
            // read in a string (this is actually very painful to see so inefficient)
            var setName = bin2String(byteView, byteOffset, setNameSize);
            byteOffset += Number(setNameSize);

            // get the page number
            var pageNumber = byteView.getBigUint64(byteOffset, true);
            
            // get the offset 
            var pageOffset = byteView.getBigUint64(byteOffset + 8, true);

            // get the page size
            var pageSize = byteView.getBigUint64(byteOffset + 16, true);

            // skip to the next
            byteOffset += 24

            snapshot["activePages"][i] = {"dbName" : dbName, "setName" : setName, "pageNumber" : pageNumber, "pageOffset" : pageOffset, "pageSize" : pageSize };
        }

        // get the number of pages
        var emptyPages = byteView.getBigUint64(byteOffset, true);
        byteOffset += 8;

        // preallocate the pages
        snapshot["freePages"] = new Array(Number(emptyPages));

        // read in the empty pages
        for (i = 0; i < emptyPages; i++) {
            
            // get the offset of a page
            var offset = byteView.getBigUint64(byteOffset + i * 16, true);

            // get the page size
            var pageSize = byteView.getBigUint64(byteOffset + i * 16 + 8, true);

            // set the free page
            snapshot["freePages"][i] = { "pageOffset" : offset, "pageSize" : pageSize }
        }

        // skip the stuff we just read
        byteOffset += Number(emptyPages) * Number(16)
        
        // add the new snapshot
        timeline["snapshots"][tick] = snapshot;
    }

    // return the timeline
    return timeline;
}

function parseSymbols(byteArray) {

    symbols = {};

    // byte array
    var byteView = new DataView(byteArray)
    
    // the offset
    var byteOffset = 0;

    while(byteView.byteLength != byteOffset) {

        // read the id of the 
        var id = byteView.getBigUint64(byteOffset, true);
        byteOffset += 8;

        // trace length 
        var traceLength = byteView.getBigUint64(byteOffset, true);
        byteOffset += 8;

        // trace addresses
        var traceAddresses = [];
        for(var i = 0; i < traceLength; ++i) {
            
            // read in the address
            var tmp = byteView.getBigUint64(byteOffset, true);
            byteOffset += 8;

            // store it
            traceAddresses.push(tmp);
        }

        // read in the description string
        var descriptionLength = byteView.getBigUint64(byteOffset, true);
        byteOffset += 8;

        // read in a string (this is actually very painful to see so inefficient)
        var description = bin2String(byteView, byteOffset, descriptionLength);
        byteOffset += Number(descriptionLength);

        // store the symbol
        symbols[id] = { "id" : id, "traceAddresses" : traceAddresses, "description" : description };
    }

    return symbols;
}

function parseTraces(byteArray) {

    // byte array
    var byteView = new DataView(byteArray)
    
    // the offset
    var byteOffset = 0;

    // we put our traces to
    traces = {};

    // scan the file
    while(byteView.byteLength != byteOffset) {

        // read the timestamp
        var timestamp = byteView.getBigUint64(byteOffset, true);
        byteOffset += 8;

        // read the traceID
        var traceID = byteView.getBigUint64(byteOffset, true);
        byteOffset += 8;

        // read the operation
        var op = byteView.getBigUint64(byteOffset, true);
        byteOffset += 8;

        // read in the size of the database name
        var dbNameSize = byteView.getBigUint64(byteOffset, true);
        byteOffset += 8;
        
        // read in a string (this is actually very painful to see so inefficient)
        var dbName = bin2String(byteView, byteOffset, dbNameSize);
        byteOffset += Number(dbNameSize);

        // read in the size of the database name
        var setNameSize = byteView.getBigUint64(byteOffset, true);
        byteOffset += Number(8);
        
        // read in a string (this is actually very painful to see so inefficient)
        var setName = bin2String(byteView, byteOffset, setNameSize);
        byteOffset += Number(setNameSize);

        // read the pageNumber
        var pageNumber = byteView.getBigUint64(byteOffset, true);
        byteOffset += 8;

        // read the value
        var value = byteView.getBigUint64(byteOffset, true);
        byteOffset += 8;

        // store the trace
        traces[timestamp] = { "timestamp" : timestamp, "traceID" : traceID, "op" : op, "dbName" : dbName, "setName" : setName, "pageNumber" : pageNumber, "value" : value };
    }

    // return traces
    return traces;
}