var map, markers;

L.Icon.Default.imagePath = 'http://localhost:8080/map/lib/leaflet/images';

Ext.onReady(function(){
    var panel = new Ext.Panel({
        width:800,
        height:595,

        tbar: [
            {
                text: 'Import Menu',
                menu: [
					new Ext.Action({
					    text: 'Import RDF/XML',
					    handler: function(){
					    	$('#myInput')[0].onchange = function(result) {													 
								 var reader = new FileReader();
								 reader.onload = function(e) {
									 var data = e.target.result;
									 console.log("Yoman1");
									 console.log(data);
								 }
								 reader.readAsText(result.target.files[0]);
					        }
							$('#myInput').click();
					    }
					}),
					new Ext.Action({
					    text: 'Import CSV',
					    handler: function(){
					    	$('#myInput')[0].onchange = function(result) {													 
								 var reader = new FileReader();
								 reader.onload = function(e) {
									 var data = CSVToJSON(e.target.result, "\t");
									 var markerData = [];
									 var polyData = [];
									 
									 for (var i = 0; i < data.length; i++) {
										 var lat = data[i].Latitude;
										 var lon = data[i].Longitude;
										 if (lat && lon && data[i].Name) {
											 lat = parseFloat(lat);
											 lon = parseFloat(lon);
											 var marker = L.marker([lat, lon])
											 		.bindPopup(data[i].Name);
											 markerData.push(marker);
											 polyData.push([lat, lon]);
										 }
									 }
									 
									 if (markerData.length > 0) {
										 if (markers) {
											 map.removeLayer(markers);
										 }
										 markers = L.layerGroup(markerData);
										 markers.addTo(map);
									 									 
										 map.fitBounds(polyData, {animate: false});
									 }
								 }
								 reader.readAsText(result.target.files[0]);
					        }
							$('#myInput').click();
					    }
					})
                ]
            }
        ],
        listeners : {
        	afterrender : function(c) {
        		map = new L.Map('map', {
        			center: new L.LatLng(-27.4667, 153.0333), zoom: 13, attributionControl: false});
        		L.control.attribution({position: 'topright'}).addTo(map);
        		var grm = new L.Google("ROADMAP");
        		map.addLayer(grm);
        	}
        },
        html : "<div id='map' style='height: 566px; width: 798px;'></div>",
        renderTo: Ext.get("maparea")
    });
    
	
});