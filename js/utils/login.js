function checkUsrInfo(usr,pw)
{
		if (usr==pw) {
			return true
		}
		else
			{return false}
}

function saveLoginInfo2cookies(usr,pw,isAutologin)
{
    Cookies.set('usr', usr);
    Cookies.set('pw', pw);
    Cookies.set('isAutologin',isAutologin)
    Cookies.set('hasbeenlogin',true)
}



function autologin()
{
    var cookies = Cookies.get();
    if (eval(cookies.isAutologin)) {
        $('input[placeholder="用户名"]').val(cookies.usr);
        $('input[placeholder="密码"]').val(cookies.pw);
        login();
    }
}
