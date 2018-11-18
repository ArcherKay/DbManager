$(function () {
    if ($('#message').val() != "") {
        db.alert($('#message').val(), 2, 2000);
    }
    else {
        init();
        query();    
    }
    SetConfig();

});

var init = function (params) {
    var url = "/CsTool/GetAllTables";
    if (params !== undefined) {
        url += params;
    }
    var columns = [
        { field: 'state', checkbox: true },
        { field: 'TableName', title: '表名称', width: 80, align: 'center', valign: 'center' },
        { field: 'TableDesc', title: '表说明', width: 80, align: 'center', valign: 'center' },
        { field: 'operate', title: '操作', align: 'center', width: 200, valign: 'middle', formatter: operateFormatter }
    ];
    db.load(url, "datagrid", columns);
}
//格式化操作列
var operateFormatter = function (value, row) {
    var html = '<a class="btn btn-primary btn-xs" onclick=buildModel(\'' + row.TableName + '\',1)><i class="fa fa-search"></i>&nbsp;生成EF模型</a>&nbsp;';
    html += '<a class="btn bg-purple btn-xs" onclick=buildModel(\'' + row.TableName + '\',2)><i class="fa fa-gears"></i>&nbsp;生成Dapper模型</a>';
    return html;
}
var query = function () {
    $('#btnQuery').click(function () {
        var tableName = $('#tablename').val();
        var params = '?tableName=' + tableName;
        init(params);
    });
}

//配置文件
var SetConfig = function () {
    $('#btnSetConfig').click(function () {
        db.open("命名空间配置", 2, ["50%", "70%"], "/CsTool/NameSpaceConfig");
    });
}



/**
 **代码生成
 **tableName：表名，type： 1-EF/2-Dapper
**/

var buildModel = function (tableName, type) {
    db.startLoding();
    $.getJSON("/CsTool/buildModel", { tableName: tableName, type: type }, function (d) {
        db.closeLoding();
        if (d.result) {
            db.success(d.message);
            return false;
        }
        db.error(d.message);
    });
}

//生成勾选项
var bulidbatchModel = function (type) {
    var ids = db.getSelectKey('datagrid', 'TableName');
    if (ids === '') {
        db.error('请选择要生成文件的数据表');
        return false;
    }
    db.startLoding();
    $.getJSON("/CsTool/buildBatchModels", { tables: ids, type: type }, function (d) {
        db.closeLoding();
        if (d.result) {
            db.success(d.message);
            return false;
        }
        db.error(d.message);
    });
}

//生成全部
var bulidAllModel = function (type) {
    db.startLoding();
    $.getJSON("/CsTool/buildAllModels", { type: type }, function (d) {
        db.closeLoding();
        if (d.result) {
            db.success(d.message);
            return false;
        }
        db.error(d.message);
    });
}

//生成三层架构
var bulidService = function () {
    db.startLoding();
    $.getJSON("/CsTool/buildService",'', function (d) {
        db.closeLoding();
        if (d.result) {
            db.success(d.message);
            return false;
        }
        db.error(d.message);
    });
}
