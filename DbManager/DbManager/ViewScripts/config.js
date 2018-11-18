$(function () {
    SaveConfig();
})


//校验字段
var checkData = function () {
    if ($("#modelName").val() == "") {
        db.error("请填写Model层命名空间"); return true;
    }
    if ($("#dalName").val() == "") {
        db.error("请填写DAL层命名空间"); return true;
    }
    if ($("#bllName").val() == "") {
        db.error("请填写BLL层命名空间"); return true;
    }
    return false;
}

var SaveConfig = function () {
    $("#btnSave").click(function () {
        if (checkData()) return false;
        var postData = {
            modelName: $("#modelName").val(),
            dalName: $("#dalName").val(),
            bllName: $("#bllName").val()
        };
        $.getJSON("/CsTool/SaveConfig", postData, function (d) {
            db.closeLoding();
            if (d.result) {
                db.success(d.message);
                return false;
            }
            db.error(d.message);
        });
    });
}