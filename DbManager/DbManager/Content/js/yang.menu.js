/********************************************************************************
** 描述: 菜单类库
** 作者：杨隆健  2018.11.1
*********************************************************************************/

$(function () {
    menusLoad();
    get_current_user();
    sign_out();
    edit_pwd_dialog();
    save_edit_pwd();
});
var menusLoad = function (id) {

    $.get('/Home/MenuLoad', { id: id }, function (menus) {
        $('#smenus').html(menus);
    });
}
//设置打开菜单页面
var storage = window.localStorage;
var setActive = function (t) {
    storage.setItem('node', $(t).text());
    var id = $(t).attr('id');
    menusLoad(id);
}

var _uName = '';
var _uId = 0;
var _uAvatar = '';

var get_current_user = function () {
    $.getJSON('/Home/GetCurrentUserInfo', {}, function (res) {
        $('#uname1').text(res.username);
        $('#uname2').text(res.username);
        $('#uname3').text(res.username);     
        if (res.avatar == null || res.avatar == "") {
            $('#avatar1').attr('src', '/images/boy.svg');
            $('#avatar2').attr('src', '/images/boy.svg');
            $('#avatar3').attr('src', '/images/boy.svg');
        }
        else {
            $('#avatar1').attr('src', res.avatar);
            $('#avatar2').attr('src', res.avatar);
            $('#avatar3').attr('src', res.avatar);
        }
        _uId = res.userid;
        _uName = res.username;
        _uAvatar = res.avatar;
    });
}

var sign_out = function () {
    $('[action="sign-out"]').click(function () {
        yang.plug.confirm("您确认要退出系统了吗？",function (index) {
            $.get('/Home/SignOut', {}, function (res) {
                yang.plug.alert(res, 2, 800);
                window.location.href = '/Login/Index';
            });
            layer.close(index);
        });
    });
}

var edit_pwd_dialog = function () {
    $('[action="edit-pwd"]').click(function () {
        yang.plug.resetform("pwdfrm");
        $('#UserName').val(_uName);
        $('#UserId').val(_uId);
        $("#myPwdModalLabel").text("密码修改");
        $('#myPwdModal').modal();
    });
}
var save_edit_pwd = function () {
    $('[acion="change-pwd"]').click(function () {
        var uid = $('#UserId').val();
        var reg = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,30}'); // 8-30位字母数字组合
        var oldPwd = $('#UserPwd').val();
        var nPwd = $('#NewUserPwd').val();
        var n2Pwd = $('#NewConfirmUserPwd').val();
        if (oldPwd === '') {
            yang.plug.error('旧密码不可为空');
            return false;
        }
        if (nPwd === '') {
            yang.plug.error('新密码不可为空');
            return false;
        }

        if (!reg.test(nPwd)) {
            yang.plug.error('密码至少要是字母+数字+特殊字符组合,至少8位,最多30位');
            return false;
        }

        if (nPwd !== n2Pwd) {
            yang.plug.error('两次密码不一致');
            return false;
        }
        if (nPwd === oldPwd) {
            yang.plug.error('旧密码不可与新密码重复');
            return false;
        }

        $.getJSON('/Home/EditUserPwd', { uid: uid, opwd: oldPwd, npwd: nPwd }, function (res) {
            if (res.success) {
                $('#myPwdModal').modal('hide');
            }
            yang.plug.success(res.msg);
            return false;

        });
        return false;
    });
}