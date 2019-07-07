
// conversion method
function bin2String (array, offset, size) {
    var result = "";
    for (var i = 0; i < size; i++) {
        result += String.fromCharCode(parseInt(array[offset + i], 2));
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