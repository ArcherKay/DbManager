$(function () {
    init();
    query();
    batchBuildModel();
    batchBuildService();
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
    html += '<a class="btn bg-purple btn-xs" onclick=build(\'' + row.TableName + '\')><i class="fa fa-gears"></i>&nbsp;生成cs模型</a>';
    return html;
}

var query = function () {
    $('#btnQuery').click(function () {
        var tableName = $('#tablename').val();
        var params = '?tableName=' + tableName;
        init(params);
    });
}
var batchBuildModel = function () {
    $('#btnBulidModel').click(function () {
        var ids = db.getSelectKey('datagrid', 'TableName');
        if (ids === '') {
            db.error('请选择要生成文件的数据表');
            return false;
        }
        alert(ids);
    });
}
var batchBuildService=function () {
    $('#btnBulidService').click(function () {
        var ids = db.getSelectKey('datagrid','TableName');
        if (ids === '') {
            db.error('请选择要生成文件的数据表');
            return false;
        }
        alert(ids);
    });
}
var bulid = function (tableName) {
}

var tableStruct = function (tableName) {
    $("#myTableStructModalLabel").text("表名：" + tableName);
    $('#myTableStructModal').modal();
    var url = '/Query/GetTableStruct?tableName=' + tableName;
    var columns = [
        { field: 'FieldName', title: '字段名', width: 100, align: 'center', valign: 'center'},
        { field: 'FieldType', title: '字段类型', width: 100, align: 'center', valign: 'center' },
        { field: 'IsNull', title: '可否为空', align: 'center', width: 50, valign: 'middle', formatter: checkFormatter  },
        { field: 'IsPK', title: '是否主键', align: 'center', width: 50, valign: 'middle', formatter: checkFormatter  },
        { field: 'IsSelfGrowth', title: '自动增长', align: 'center', width: 50, valign: 'middle', formatter: checkFormatter },
        { field: 'BytesOccupied', title: '占用字节', align: 'center', width: 50, valign: 'middle' },
        { field: 'FieldLength', title: '长度', align: 'center', width: 50, valign: 'middle' },
        { field: 'FieldBit', title: '小数位数', align: 'center', width: 50, valign: 'middle' },
        { field: 'FieldDefault', title: '默认值', align: 'center', width: 50, valign: 'middle' },
        { field: 'FieldDesc', title: '字段描述', align: 'center', width: 100, valign: 'middle' }

    ];
    db.load(url, "tableStructdatagrid", columns);
}
var checkFormatter = function (value, row) {
    html = '<input type="checkbox" />'
    if (value == "True") html = '<input type="checkbox" checked=checked />'
    return html;
}