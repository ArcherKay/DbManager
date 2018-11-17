$(function () {
    init();
    query();
    bulidbatchModel();
    bulidAllModel();
    //bulidAllService();
    //SetConfig();
});

var init = function (params) {
    var url = "/Query/GetAllTables";
    if (params !== undefined) {
        url += params;
    }
    var columns = [
        { field: 'state', checkbox: true },
        { field: 'TableName', title: '表名称', width: 80, align: 'center', valign: 'center' },
        { field: 'TableDesc', title: '表说明', width: 80, align: 'center', valign: 'center'},
        { field: 'operate', title: '操作', align: 'center', width: 200, valign: 'middle', formatter: operateFormatter }
    ];
    db.load(url, "datagrid", columns);
}
//格式化操作列
var operateFormatter=function (value, row) {
    var html = '<a class="btn btn-primary btn-xs" onclick=tableStruct(\'' + row.TableName + '\')><i class="fa fa-search"></i>&nbsp;查看表结构</a>&nbsp;';
    html += '<a class="btn bg-purple btn-xs" onclick=buildModel(\'' + row.TableName + '\')><i class="fa fa-gears"></i>&nbsp;生成cs模型</a>';
    return html;
}
var query = function () {
    $('#btnQuery').click(function () {
        var tableName = $('#tablename').val();
        var params = '?tableName=' + tableName;
        init(params);
    });
}

var tableStruct = function (tableName) {
    db.open("表名："+tableName,2,['90%', '100%'], '/Query/Detail?tableName=' + tableName);
}

/**
 * 代码生成
**/
var buildModel = function (tableName) {
    db.startLoding();
    $.getJSON("/Query/buildModel", { tableName: tableName }, function (d) {
        db.closeLoding();
        if (d.result) {
            db.success(d.message);
            return false;
        }
        db.error(d.message);
    });
}


var bulidbatchModel = function () {
    $('#btnBatchModel').click(function () {
        var ids = db.getSelectKey('datagrid', 'TableName');
        if (ids === '') {
            db.error('请选择要生成文件的数据表');
            return false;
        }
        db.startLoding();
        $.getJSON("/Query/buildBatchModels", { tables: ids }, function (d) {
            db.closeLoding();
            if (d.result) {
                db.success(d.message);
                return false;
            }
            db.error(d.message);
        });
    });
}

var bulidAllModel = function () {
    $('#btnAllModel').click(function () {
        db.startLoding();
        $.getJSON("/Query/buildAllModels", "", function (d) {
            db.closeLoding();
            if (d.result) {
                db.success(d.message);
                return false;
            }
            db.error(d.message);
        });
    });
}
