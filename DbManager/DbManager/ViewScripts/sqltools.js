var delTr = function () {
    //获取选中的复选框，然后循环遍历删除
    var ckbs = $('input[name="ckb"]:checked');
    if (ckbs.length == 0) {
        db.error("没有选中需要删除的行");
        return;
    }
    ckbs.each(function () {
        $(this).closest('tr').remove();
    });
}

var AddTr = function (tab) {
    var trHtml = '<tr><td><input type="checkbox" class="form-control" name="ckb" /></td>' +
        '<td><input type="text" class="form-control" name="fieldname" /></td>' +
        '<td><input type="text" class="form-control" name="fieldtype" /></td>' +
        '<td><input type="text" class="form-control" name="fielddesc" /></td></tr>';
    var $tb = $("#" + tab + " tbody");
    $tb.append(trHtml);
    db.initIcheck();
}

//生成
function Build() {
    if ($('#txtTableName').val() == "") { db.error("请输入表名称！"); $('#txtTableName').focus(); return false; }
    if ($('#txtTableDesc').val() == "") { db.error("请输入表描述！"); $('#txtTableDesc').focus(); return false; }

    if ($("#tb tbody").find("tr").length == 0) { db.error("请添加表格字段！"); return false; }
    var tableList = "[";
    var result = false;

    $("#tb tbody").find("tr").each(function () {
        var tds = $(this).children();
        var name = tds.eq(1).find("input").val();
        var type = tds.eq(2).find("input").val();
        var desc = tds.eq(3).find("input").val();
        if (name == "") { db.error("请输入字段名！"); tds.eq(1).find("input").focus(); result = true; }
        if (type == "") { db.error("请输入字段类型！"); tds.eq(2).find("input").focus(); result = true; }
        if (desc == "") { db.error("请输入字段描述！"); tds.eq(3).find("input").focus(); result = true; }
        tableList += "{\"FieldName\":\"" + $.trim(name) + "\",\"FieldType\":\"" + $.trim(type) + "\",\"FieldDesc\":\"" + $.trim(desc) + "\"},";
    });
    if (result) return false;
    var postData = {
        tableName: $("#txtTableName").val(),
        tableDesc: $("#txtTableDesc").val(),
        tableIndex: $("#txtTableIndex").val(),
        tableList: $.parseJSON(tableList.substring(0, tableList.length - 1) + "]")
    };
    $.ajax({
        url: '/SqlTool/CreateSql',
        data: postData,
        dataType: "json",
        type: "POST",
        success: function (res) {
            layer.open({
                type: 1,
                title: 'SQL脚本预览窗口',
                //skin: 'layui-layer-rim', //加上边框
                area: ['90%', '100%'], //宽高
                content: res
            });
        }
    });
}

function SqlView() {
    $.getJSON("/SqlTool/SqlTemplate", "", function (res) {
        layer.open({
            type: 1,
            title:'新建表SQL脚本示例',
            skin: 'layui-layer-rim', //加上边框
            area: ['90%', '100%'], //宽高
            content: res
        });
    });
}

function Build2() {
    if ($('#alterTableName').val() == "") { db.error("请输入要修改的表名称！"); $('#txtTableName').focus(); return false; }
    if ($("#tb1 tbody").find("tr").length == 0) { db.error("请添加表格字段！"); return false; }
    var tableList = "[";
    var result = false;
    $("#tb1 tbody").find("tr").each(function () {
        var tds = $(this).children();
        var name = tds.eq(1).find("input").val();
        var type = tds.eq(2).find("input").val();
        var desc = tds.eq(3).find("input").val();
        if (name == "") { db.error("请输入字段名！"); tds.eq(1).find("input").focus(); result = true; }
        if (type == "") { db.error("请输入字段类型！"); tds.eq(2).find("input").focus(); result = true; }
        if (desc == "") { db.error("请输入字段描述！"); tds.eq(3).find("input").focus(); result = true; }
        tableList += "{\"FieldName\":\"" + $.trim(name) + "\",\"FieldType\":\"" + $.trim(type) + "\",\"FieldDesc\":\"" + $.trim(desc) + "\"},";
    });
    if (result) return false;
    var postData = {
        tableName: $("#alterTableName").val(),
        tableList: $.parseJSON(tableList.substring(0, tableList.length - 1) + "]")
    };
    $.ajax({
        url: '/SqlTool/CreateFieldSql',
        data: postData,
        dataType: "json",
        type: "POST",
        success: function (res) {
            layer.open({
                type: 1,
                title: 'SQL脚本预览窗口',
                skin: 'layui-layer-rim',
                area: ['90%', '50%'],
                content: res
            });
        }
    });
}

function SqlView2() {
    $.getJSON("/SqlTool/FieldSqlTemplate", "", function (res) {
        layer.open({
            type: 1,
            title: '增加字段示例',
            skin: 'layui-layer-rim',
            area: ['90%', '50%'],
            content: res
        });
    });
}