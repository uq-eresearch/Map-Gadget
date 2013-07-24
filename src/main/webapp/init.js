Ext.onReady(function(){
    // The action
    var action = new Ext.Action({
        text: 'Action 1',
        handler: function(){
            Ext.example.msg('Click','You clicked on "Action 1".');
        },
        iconCls: 'blist'
    });


    var panel = new Ext.Panel({
        width:800,
        height:595,

        tbar: [
            action, {
                text: 'Action Menu',
                menu: [action]
            }
        ],

        html : "<div id='map' style='height: 566px; width: 798px;'></div>",
        renderTo: Ext.getBody()
    });
    
	var map = new L.Map('map', {
		center: new L.LatLng(-27.4667, 153.0333), zoom: 13, attributionControl: false});
	L.control.attribution({position: 'topright'}).addTo(map);
	var grm = new L.Google("ROADMAP");
	map.addLayer(grm);
});