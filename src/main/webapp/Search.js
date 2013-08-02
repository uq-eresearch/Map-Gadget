function searchHUNI(matchval) {
	if (matchval == null || matchval == "") {
		return;
	}
	
	if (matchval.indexOf(" ") != -1) {
		var split = matchval.split(" ");
		matchval = "";
		for (var i = 0; i < split.length; i++) {
			matchval += split[i];
			if (i < (split.length - 1)) {
				matchval += "%20AND%20";
			}
		}
	}
	
	var queryURL = "http://huni.esrc.unimelb.edu.au/solr/huni/select?q=(text:" 
		+ matchval + "%20OR%20text_rev:" + matchval + ")&rows=999999&wt=json" 
   	
    var oThis = this;
    var params = {};
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
    
    gadgets.io.makeRequest(queryURL, function(response){
	   	
    	var docs = response.data.response.docs;
    	
        var markerData = [];
		var polyData = [];
		
    	for (var i = 0; i < docs.length; i++) {  
        	var doc = docs[i];
        	
        	if (doc.latitude && doc.longitude) {
        		var lat = parseFloat(doc.latitude);
        		var lon = parseFloat(doc.longitude);
        		
        		if (!isNaN(lat) && !isNaN(lon)) {
	        		var url = doc.prov_source;
	        		var title = doc.name;
	        		        		
	        		var marker = L.marker([lat, lon])
				 		.bindPopup("<a href=\"" + url + "\" target=\"_parent\">" + title + "</a>");
			        markerData.push(marker);
			        polyData.push([lat, lon]);
        		}
        	}
    	}
    	addToLayer(markerData, polyData, "\"" + matchval + "\"");
    	
    }, params);
}