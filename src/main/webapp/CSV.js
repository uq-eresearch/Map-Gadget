function CSVToJSON(strData, strDelimiter ){
	strDelimiter = (strDelimiter || ",");

	var objPattern = new RegExp(("(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\"\\" + strDelimiter + "\\r\\n]*))"),"gi");
	var arrData = [[]];
	var arrMatches = null;
	while (arrMatches = objPattern.exec( strData )){
		var strMatchedDelimiter = arrMatches[ 1 ];
		if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)){
			arrData.push( [] );
		}
		if (arrMatches[ 2 ]){
			var strMatchedValue = arrMatches[ 2 ].replace(new RegExp( "\"\"", "g" ), "\"");
		} else {
			var strMatchedValue = arrMatches[ 3 ];
		}
		arrData[ arrData.length - 1 ].push( strMatchedValue );
	}

	var headers = arrData[0];
	var JSONData = [];
	
	for (var i = 1; i < arrData.length; i++) {
		if (arrData[i].length == arrData[0].length) {
			var JSONObj = {};
			for (var j = 0; j < arrData[0].length; j++) {
				JSONObj[arrData[0][j]] = arrData[i][j];
			}
			JSONData.push(JSONObj);
		}
	}
	
	return JSONData;
}