
function collectionfadeout()
{

    $("#menu_setting").animate({bottom:'-60%'},function(){
    });
    $("#menu_on").animate({bottom:'-60%'},function(){
    });
    $("#map").animate({height:"100%"},function(){
        mapLayers._onResize();
        mapLayers.panTo(local);
    });
    $(".left_list").animate({bottom:'3.7rem'});
    $(".right_list").animate({bottom:'3.7rem'});
    $("#menu_on").hide()
    $("#menu_setting").hide()
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

//初始化加载地图
function mapInit(){
    //C_BLANK_MAP
    mapLayers = new CMapLayers('map', { mapTypes: [TDTVECTORMAP,TDTMIXMAP], center: new CLatLng(39.9,116.37), zoom: 11, doubleClickZoom: false });
    mapLayers.addLatLngCtl();
    CEvent.addListener(mapLayers,"click",function(){
        $("#m_close").click();
    });
    //addUserMarker();
    
    addLocationUserMarker();
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

function checklogin() {
    var hasbeenlogin = eval(Cookies.get('hasbeenlogin'));
    readCollectorInfo4Cookies()
    return Boolean(hasbeenlogin)
}
    
function displaymenu(idstr){
    $("#menu_on").hide()
    $("#menu_setting").hide()
    $(idstr).show()
    $(idstr).animate({bottom:'0px'},function(){
    });
    $("#map").animate({height:"40%"},function(){
        mapLayers._onResize();
        mapLayers.panTo(local);
    });
    $(".left_list").animate({bottom:'65%'});
    $(".right_list").animate({bottom:'65%'});
}

function unlogin(){
    var r=confirm("确认退出登陆");
    if (r==true)
    {
        Cookies.set('hasbeenlogin',false);
        Cookies.set('isAutologin',false);
        location.replace('./login.html');
    }
}

function gettask(){
    // to do
    var tasklist = new Array
for (let i=65;i<91;i++) {
    tasklist.push(String.fromCharCode(i))
}
for(let i = 0;i < tasklist.length; i++){
    var rand = parseInt(Math.random()*tasklist.length);
       t = tasklist[rand];
       tasklist[rand] =tasklist[i];
       tasklist[i] = t;
  }
  return tasklist.slice(0,3)
}

function loadtask() {

    var task = gettask(); 
    list = $('#tasklist');
    len = $('li#task').length
    for (let i = 0; i <len ; i++) {
        $('li#task').get(0).remove()
    }
   
    for (let i = 0; i < task.length; i++) {
        const element = task[i];
        list.append("<li id='task'>" +element+"</li>")
        
    }
}

function settingInit() {
    var isAutologin= eval(Cookies.get('isAutologin'));
    var isAutolocated = eval(Cookies.get('isAutolocated'));
    $("#AutoLoginSwitch").get(0).checked = isAutologin;
    $("#AutoLocatedSwitch").get(0).checked = isAutolocated;
    $('#unlogin').click(unlogin);
    loadtask();
    $("#AutoLoginSwitch").click(function() {  
        if ($("#AutoLoginSwitch").is(':checked')) {  
            Cookies.set('isAutologin',true);  
        } else {  
            Cookies.set('isAutologin',false);  
        }  
    })
    var t
    $("#AutoLocatedSwitch").click(function() {  
        if ($("#AutoLocatedSwitch").is(':checked')) {  
            t = setInterval('addLocationUserMarker()',2e3);  
        } else {  
            t=window.clearInterval(t);  
        }  
    })
    $('#refreshTask').click(loadtask)

}