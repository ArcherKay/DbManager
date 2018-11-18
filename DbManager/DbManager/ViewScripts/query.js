$(function () {
	if ($('#message').val() != "") {
		db.alert($('#message').val(),2,2000);
	}
	else {
		init();
		query();
	}
});

var init = function (params) {
    var url = "/Query/GetAllTables";
    if (params !== undefined) {
        url += params;
    }
    var columns = [      
        { field: 'TableName', title: '表名称', width: 100, align: 'center', valign: 'center' },
        { field: 'TableDesc', title: '表说明', width: 100, align: 'center', valign: 'center' },
        { field: 'operate', title: '操作', align: 'center', width: 100, valign: 'middle', formatter: operateFormatter }
        
    ];
    db.load(url, "datagrid", columns);
}
//格式化操作列
var operateFormatter=function (value, row) {
    var html = '<a class="btn btn-primary btn-xs" onclick=tableStruct(\'' + row.TableName + '\')><i class="fa fa-search"></i>&nbsp;查看表结构</a>';
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
