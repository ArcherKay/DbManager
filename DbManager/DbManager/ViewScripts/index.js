//初始化数据
function init() {
    $.getJSON("/DBSet/GetCurrentUseDBName", "", function (data) {
        $("#spCurrentUseDBName").text(data.name);
    });
}

//数据库连接测试
function ConnectedTest() {
    $("#btnConectedTest").click(function () {
        if ($("#inp_DBName").val() == "" || $("#inp_DBLoginName").val() == "" || $("#inp_DBPwd").val() == "" || $("#inp_DBServer").val() == "") {
            $("#divErrMsg").show();
            $("#spanErrorMsg").text("参数填写不完整");
            return false;
        } else {
            $("#divErrMsg").hide();
        }

        var postData = {
            dbUserId: $("#inp_DBLoginName").val(),
            dbPwd: $("#inp_DBPwd").val(),
            dbServer: $("#inp_DBServer").val()
        };
        $.getJSON("/DBSet/ConnectedTest", postData, function (con) {
            if (con.con) {
                $("#divErrMsg").hide();
                $("#divSuccessMsg").show();
                LoadCurrentSysDBs(JSON.parse(con.dbs));
            } else {
                $("#divSuccessMsg").hide();
                $("#divErrMsg").show();
                $("#spanErrorMsg").text(con.err);
            }
        });
    });

}

//初始化当前服务器下的所有数据库名称
function LoadCurrentSysDBs(json) {
    $("#selDBS").html("");
    $("#selDBS").append("<option value='-1'>--请选择数据库--</option>");

    for (var i = 0; i < json.Table.length; i++)
        $("#selDBS").append("<option>" + json.Table[i].Name + "</option>");
}

//保存当前数据库配置
function SaveCurrentDBSet() {
    $("#btnSave").click(function () {
        try {
            var isCon = $("#selDBS").val();
            if (isCon == "-1") {
                $("#divDBSaveErr").show();
                $("#spanDBSaveErr").text("数据库名称未选择。 err：可能未进行连接测试");
                return;
            } else { $("#spanDBSaveErr").hide(); }

            var postData = {
                server: $("#inp_DBServer").val(),
                dbName: isCon,
                loginId: $("#inp_DBLoginName").val(),
                loginPwd: $("#inp_DBPwd").val()
            }

            $.getJSON("/DBSet/SaveChanges", postData, function (msg) {
                if (msg.success) {
                    alert("保存成功");
                } else {
                    alert("保存失败");
                }
            });
        } catch (e) {
            console.log(e.message);
        }

    });
}