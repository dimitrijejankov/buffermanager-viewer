function loadMe()
{

    // conversion method
    function bin2String (array, offset, size) {
        var result = "";
        for (var i = 0; i < size; i++) {
            result += String.fromCharCode(parseInt(array[offset + i], 2));
        }
        return result;
    }

    var fileInput = document.getElementById('browseOpen');
    var fReader = new FileReader();
    
    fReader.onload = function(e) {

        // grab the byte array
        var byteArray = e.target.result

        // to read the uint64 types
        var uint64View = new BigUint64Array(byteArray);

        // byte array
        var byteView = new Int8Array(byteArray)

        // check the magic number
        var magicNumber = uint64View[0];
        if(magicNumber != 10202026){
            alert("This is not a timeline file");
        }
        
        // get the number of pages
        var numberOfPages = uint64View[1];

        // get the page size
        var pageSize = uint64View[2];

        // skip the first three numbers
        uint64View = uint64View.slice(3);

        var timeline = { "pageSize" : pageSize, "numberOfPages" : numberOfPages, "snapshots" : {} };

        while(uint64View.byteLength != 0) {
            
            // the snapshot object we are going to fill up
            var snapshot = { "activePages" : [] , "freePages" : [] };

            // get the tick of the snapshot
            var tick = uint64View[0];

            // get the number of pages
            var activePages = uint64View[1];

            // remove the last two ints
            uint64View = uint64View.slice(2);

            // preallocate the pages
            snapshot["activePages"] = new Array(Number(activePages));

            // get all the pages
            var i;
            for (i = 0; i < activePages; i++) {

                // read in the size of the database name
                var dbNameSize = uint64View[0];
                uint64View = uint64View.slice(1);
                
                // read in a string (this is actually very painful to see so inefficient)
                var offset = byteArray.byteLength - uint64View.byteLength
                var dbName = bin2String(byteView, byteArray.byteLength - uint64View.byteLength, dbNameSize);
                uint64View = new BigUint64Array(byteArray.slice(offset + Number(dbNameSize)));

                // read in the size of the database name
                var setNameSize = uint64View[0];
                uint64View = uint64View.slice(1);
                
                // read in a string (this is actually very painful to see so inefficient)
                var offset = byteArray.byteLength - uint64View.byteLength
                var setName = bin2String(byteView, byteArray.byteLength - uint64View.byteLength, setNameSize);
                uint64View = new BigUint64Array(byteArray.slice(offset + Number(dbNameSize)));

                // get the page number
                var pageNumber = uint64View[0];
                
                // get the offset 
                var pageOffset = uint64View[1];

                // get the page size
                var pageSize = uint64View[2];

                // skip to the next
                uint64View = uint64View.slice(3);

                snapshot["activePages"][i] = {"dbName" : dbName, "setName" : setName, "pageNumber" : pageNumber, "pageOffset" : pageOffset, "pageSize" : pageSize };
            }

            // get the number of pages
            var emptyPages = uint64View[0];
            uint64View = uint64View.slice(1);

            // preallocate the pages
            snapshot["freePages"] = new Array(Number(emptyPages));

            // read in the empty pages
            for (i = 0; i < emptyPages; i++) {
                
                // get the offset of a page
                var offset = uint64View[i * 2];

                // get the page size
                var pageSize = uint64View[i * 2 + 1];
            }

            // skip the stuff we just read
            uint64View = uint64View.slice(Number(emptyPages) * 2);
            
            // add the new snapshot
            timeline["snapshots"][tick] = snapshot;
        }
    }
    
    fileInput.onchange = function(e) {
        var file = this.files[0];
        fReader.readAsArrayBuffer(file);
    }
}
window.onload=loadMe;