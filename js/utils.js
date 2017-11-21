
function collectionfadeout()
{
    $("#menu_on").animate({bottom:'-60%'},function(){
    });
    $("#map").animate({height:"100%"},function(){
        mapLayers._onResize();
        mapLayers.panTo(local);
    });
    $(".left_list").animate({bottom:'3.7rem'});
    $(".right_list").animate({bottom:'3.7rem'});
}

//GPS控件
function addGPSControl() {
    mapLayers.addGPS();
}

//GPS定位
function addLocationUserMarker() {
    //移动设备上使用，PC上Firefox可以使用
    //var marker = null;
    mapLayers.on("locationfound", function (location) {
        //if (!marker)
        //	marker = new CUserMarker(location.latlng, { smallIcon: false,pulsing: true }).addTo(map);
        //marker.setLatLng(location.latlng);
        //marker.setAccuracy(location.accuracy);

        //alert(location.latlng.lat+","+location.latlng.lng);
        $("#lat").val(location.latlng.lat);
        $("#lng").val(location.latlng.lng);
        local = new CLatLng(location.latlng.lat,location.latlng.lng);
        addUserMarker(location.latlng.lat,location.latlng.lng);
    });
    mapLayers.locate({
        watch: false,
        locate: true,
        setView: true,
        enableHighAccuracy: true
    });
}

function addUserMarker(lat,lng) {
    mapLayers.clearOverlays();
    var marker = new CUserMarker([lat,lng], { smallIcon: false, pulsing: true });
    mapLayers.addOverlay(marker);
}

function checkcollectioninfo(rawdata)
{
    var data = rawdata.serializeArray()
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if(element['value'] == ''){
            alert(element['name'] + ' is empty');
            return false;
        }
    }
    return true
}

function saveCollectorInfo2Cookies(rawdata)
{
    var data = rawdata.serializeArray();
    var names = new Array()
    var values = new Array()
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        names.push(element['name']);
        values.push(element['value']);
    }
    Cookies.set('names', names);
    Cookies.set('values', values);
}

function readCollectorInfo4Cookies()
{
    var names = eval(Cookies.get('names'));
    var values = eval(Cookies.get('values'));
    if(!names)
        return 0
    for (let index = 0; index < names.length; index++) {
        $('#'+names[index]).val(values[index]);
    }
}

function clearFormInfo(clnName) {
    for(var i =0;i < clnName.length; i++){
        $('#'+clnName[i]).val('');
        }
    }
