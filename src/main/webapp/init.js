var map, control, store, rType, win, listView, openURLButton;
var markers = [];
var overlays = [];

var NAMESPACES = {
    "dc"      	: "http://purl.org/dc/elements/1.1/",
    "dc10"    	: "http://purl.org/dc/elements/1.1/",
    "dcterms" 	: "http://purl.org/dc/terms/",
    "ore"     	: "http://www.openarchives.org/ore/terms/",
    "foaf"    	: "http://xmlns.com/foaf/0.1/",
    "layout"  	: "http://maenad.itee.uq.edu.au/lore/layout.owl#",
    "rdf"     	: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "xhtml"   	: "http://www.w3.org/1999/xhtml",
    "annotea" 	: "http://www.w3.org/2000/10/annotation-ns#",
    "annotype"	: "http://www.w3.org/2000/10/annotationType#",
    "thread"  	: "http://www.w3.org/2001/03/thread#",
    "annoreply" : "http://www.w3.org/2001/12/replyType#",
    "vanno"   	: "http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#",
    "sparql"  	: "http://www.w3.org/2005/sparql-results#",
    "http"    	: "http://www.w3.org/1999/xx/http#",
    "xsd"     	: "http://www.w3.org/2001/XMLSchema#",
    "oac"     	: "http://www.openannotation.org/ns/",
    "owl"     	: "http://www.w3.org/2002/07/owl#",
    "rdfs"    	: "http://www.w3.org/2000/01/rdf-schema#",
    "austlit" 	: "http://austlit.edu.au/owl/austlit.owl#",
    "danno"   	: "http://metadata.net/2009/09/danno#",
    "lorestore" : "http://auselit.metadata.net/lorestore/",
    "cnt"     	: "http://www.w3.org/2011/content#",
    "ecrm"		: "http://erlangen-crm.org/current/",
    "skos"		: "http://www.w3.org/2004/02/skos/core#"
};

L.Icon.Default.imagePath = 'http://localhost:8080/map/lib/leaflet/images';

function addToLayer(markerData, polyData, listname) {
	if (markerData.length > 0) {		
		markers = markers.concat(markerData);
		
		var markerData = L.layerGroup(markerData);
		
		overlays.push(markerData);
		
		control.addOverlay(markerData, listname);
		control.removeFrom(map);
		control.addTo(map);
		map.addLayer(markerData);
		
		map.fitBounds(polyData, {animate: false, padding: [10, 10]});
	}
};

Ext.onReady(function(){
	rType = Ext.data.Record.create(['name', 'url', {name:'lat', type: 'float'}, {name:'lng', type: 'float'}]);
	
	store = new Ext.data.JsonStore({
        fields: rType,
        data : []
    });
	
    var panel = new Ext.Panel({
        width:744,
        height:595,

        tbar: [
            {
                text: 'Import/Export ',
                menu: [
					{
						text: 'Import from LORE',
						menu: {
						    items: [
						        new Ext.Action({
								    text: 'RDF/XML',
								    handler: function(){
								    	$('#myInput')[0].onchange = function(result) {													 
								    		var reader = new FileReader();
											 reader.onload = function(e) {
										         var markerData = [];
												 var polyData = [];
												 
												 var data = e.target.result;
												 var doc = new DOMParser().parseFromString(data, "text/xml");
												 
												 var databank = jQuery.rdf.databank();
										         for (ns in NAMESPACES) {
										             databank.prefix(ns, NAMESPACES[ns]);
										         }
										         databank.load(doc);
										         var loadedRDF = jQuery.rdf({
										        	 databank : databank
										         });
										         
										         var remQuery = loadedRDF.where('?url dc:title ?title')
										         	.where('?url dc:latitude ?lat').where('?url dc:longitude ?lon');
										         							         
										         for (var i = 0; i < remQuery.length; i++) {
											         var res = remQuery.get(i);
											         
											         var lat = parseFloat(res.lat.value.toString());
											         var lon = parseFloat(res.lon.value.toString());
											         
											         var marker = L.marker([lat, lon], {"name": res.title.value.toString(), "url": res.url.value.toString()})
												 		.bindPopup("<a href=\"" + res.url.value.toString() +
												 				"\">" + res.title.value.toString() + "</a>");
											         markerData.push(marker);
											         polyData.push([lat, lon]);
										         }
										         
										         addToLayer(markerData, polyData, "RDF/XML Data");
											 }
											 reader.readAsText(result.target.files[0]);
								        }
										$('#myInput').click();
								    }
								}),
								new Ext.Action({
								    text: 'JSON',
								    handler: function(){
								    	$('#myInput')[0].onchange = function(result) {													 
											 var reader = new FileReader();
											 reader.onload = function(e) {
												 var data = jQuery.parseJSON(e.target.result);
												 var markerData = [];
												 var polyData = [];
												 	
												 for (var recordID in data) {
													 var record = data[recordID];
													 
													 if (record["http://purl.org/dc/elements/1.1/latitude"] &&
															 record["http://purl.org/dc/elements/1.1/longitude"]) {											 
														 var lat = parseFloat(record["http://purl.org/dc/elements/1.1/latitude"][0].value);
														 var lon = parseFloat(record["http://purl.org/dc/elements/1.1/longitude"][0].value);
														 
														 var marker = L.marker([lat, lon], {"name": record["http://purl.org/dc/elements/1.1/title"][0].value, "url": recordID})
														 		.bindPopup("<a href=\"" + recordID + "\">" + 
														 				record["http://purl.org/dc/elements/1.1/title"][0].value + "</a>");
														 markerData.push(marker);
														 polyData.push([lat, lon]);
													 }
												 }
												 
												 addToLayer(markerData, polyData, "JSON Data");
											 }
											 reader.readAsText(result.target.files[0]);
								        }
										$('#myInput').click();
								    }
								})
						    ]
						}      
					},
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
											 var marker = L.marker([lat, lon], {"name": data[i].Name})
											 		.bindPopup(data[i].Name);
											 markerData.push(marker);
											 polyData.push([lat, lon]);
										 }
									 }
									 
									 addToLayer(markerData, polyData, "CSV Data");
								 }
								 reader.readAsText(result.target.files[0]);
					        }
							$('#myInput').click();
					    }
					}),
					new Ext.Action({
					    text: 'Export to JSON',
					    handler: function(){
					    	var jsonArray = [];
		                	for (var i = 0; i < overlays.length; i++) {
		                		if (map.hasLayer(overlays[i])) {
			                		overlays[i].eachLayer(function (layer) {
			                			var latlng = layer.getLatLng();			                					
			                			jsonArray.push({
			                				"name" : layer.options.name,
			                				"url" : layer.options.url,
			                				"lat" : latlng.lat,
			                				"lng" : latlng.lng,
			                			});
			                		});
			                	}
		                	}

		                	if (jsonArray.length > 0) {
		                		var blob = new Blob([Ext.util.JSON.encode(jsonArray)], {type: "text/plain;charset=utf-8"});
            	        		saveAs(blob, "JSON.txt");
		                	}
					    }
					})
                ]
            },
            {
                xtype: 'tbseparator'
            },
            new Ext.Action({
                text: 'Search HuNI',
                handler: function(){
                	Ext.MessageBox.prompt(
	        			'Search HuNI', 
	        			'Please enter your search terms',
	        			function(btn, text){
	                	    if (btn == 'ok'){
	                	        searchHUNI(text);
	                	    }
	        			}
	        		);
                }
            }),
            {
                xtype: 'tbseparator'
            },
            new Ext.Action({
                text: 'List View',
                handler: function(){  
                	if (win) {
                		win.close();
                	}
                	store.clearData();
                	for (var i = 0; i < markers.length; i++) {
                		var m = markers[i];
                		if (map.getBounds().contains(m.getLatLng())) {
                			var latLng = m.getLatLng();
                        	store.add(new rType({"name": m.options.name, "url": m.options.url, "lat": latLng.lat,"lng": latLng.lng}));
                		}
                	}
                	
                	listView = new Ext.list.ListView({
                        store: store,
                        multiSelect: true,
                        emptyText: 'No images to display',
                        reserveScrollOffset: true,
                        style: 'background: white;',
                        columns: [{
                            header: 'Name',
                            width: .3,
                            dataIndex: 'name'
                        },{
                            header: 'URL',
                            width: .45,
                            dataIndex: 'url'
                        },{
                            header: 'Latitude',
                            dataIndex: 'lat',
                            width: .125
                        },{
                            header: 'Longitude',
                            dataIndex: 'lng',
                            width: .125
                        }]
                    });
                	
                    listView.on('selectionchange', function(view, nodes){
                        if (nodes.length > 0) {
                        	openURLButton.enable();
                        } else {
                        	openURLButton.disable();                        	
                        }
                    });
                	
                    openURLButton = new Ext.Action({
                        text: 'Open URL',
                        disabled: true,
                        handler: function(){
                        	if (listView.selected.elements.length > 0) {
                        		for (var i = 0; i < listView.selected.elements.length; i++) {
                        			window.open(listView.selected.elements[i].childNodes[1].textContent,'_blank');  
                        		}
                        	}
                        }
                    });
                    
                	win = new Ext.Window({
                        closable:false,
                        width:600,
                        height:350,
                        layout:'fit',

                        tbar: [
                               new Ext.Action({
		                            text: 'Export',
		                            handler: function(){
		                	        	var jsonArray = [];
		    		                	for (var i = 0; i < store.data.items.length; i++) {
		    		                		jsonArray.push(store.data.items[i].data);
		    		                	}
		                    			
		    		                	if (jsonArray.length > 0) {
		    		                		var blob = new Blob([Ext.util.JSON.encode(jsonArray)], {type: "text/plain;charset=utf-8"});
		                	        		saveAs(blob, "JSON.txt");
		    		                	}
		                            }
		                        }),
		                        openURLButton,
		                        '->',
		                        new Ext.Action({
		                            text: 'Close',
		                            handler: function(){
		                        		win.close();		                            	
		                            }
		                        })
                        ],
                        items: [
                            listView
                        ]
                    });
                	
                    win.show(this);
                }
            }),
            {
                xtype: 'tbseparator'
            },
            new Ext.Action({
                text: 'Clear All',
                handler: function(){
                	for (var i = 0; i < overlays.length; i++) {
                		map.removeLayer(overlays[i])
                		control.removeLayer(overlays[i]);
                	}
                	
                	markers = [];
                	
            		control.removeFrom(map);
            		control.addTo(map);
                }
            })
        ],
        listeners : {
        	afterrender : function(c) {
        		var grm1 = new L.Google("ROADMAP");
        		var grm2 = new L.Google("SATELLITE");
        		var grm3 = new L.Google("HYBRID");
        		map = new L.Map('map', {
        			center: new L.LatLng(-25.854280, 133.242188), 
        			zoom: 4, attributionControl: false, layers: [grm1]});
        		
        		
        		L.control.attribution({position: 'topright'}).addTo(map);
        		control = L.control.layers({"Roadmap" : grm1, "Satellite" : grm2, "Hybrid" : grm3});
        		control.addTo(map);
        	}
        },
        html : "<div id='map' style='height: 566px; width: 742px;'></div>",
        renderTo: Ext.get("maparea")
    });	
});