$(function () {
    init();
    ConnectedTest();
    SaveCurrentDBSet();
})

//初始化数据
var init=function() {
    $.getJSON("/Home/GetCurrenDb", "", function (data) {
        $("#currenDbName").val(data.DbName);
        $("#dbServer").val(data.DbServerAddress);
        $("#dbName").val(data.DbName);
        $("#dbLoginUser").val(data.DbLoginUser);
        $("#dbLoginPwd").val(data.DbLoginPwd);
    });
}

//校验字段
var checkData = function () {
    if ($("#dbServer").val() == "") {
        db.error("请填写服务器地址"); return true;
    }
    if ($("#dbName").val() == "") {
        db.error("请填写数据库名称"); return true;
    }
    if ($("#dbLoginUser").val() == "") {
        db.error("请填写数据库登录账号"); return true;
    }
    if ($("#dbLoginPwd").val() == "") {
        db.error("请填写数据库登录密码"); return true;
    }
    return false;
}

//获取页面字段传参
var getInputConfig = function () {
    var postData = {
        DbServerAddress: $("#dbServer").val(),
        DbName: $("#dbName").val(),
        DbLoginUser: $("#dbLoginUser").val(),
        DbLoginPwd: $("#dbLoginPwd").val()
    };
    return postData;
}


//数据库连接测试
var ConnectedTest = function () {
    $("#btnConectedTest").click(function () {
        if (checkData()) return false;
        db.startLoding();
        var postData = getInputConfig();
        $.getJSON("/Home/ConnectedTest", postData, function (d) {
            db.closeLoding();
            if (d.result) {
                db.success(d.message);
                return false;
            }
            db.error(d.message);
        });
    });

}

//保存当前数据库配置
var SaveCurrentDBSet = function () {
    $("#btnSave").click(function () {
        if (checkData()) return false;
        var postData = getInputConfig();
        $.getJSON("/Home/SaveCurrentDBSet", postData, function (d) {
            db.closeLoding();
            if (d.result) {
                $("#currenDbName").val($("#dbName").val());
                db.success(d.message);
                return false;
            }
            db.error(d.message);
        });
    });
}