$(function () {
	if ($('#message').val() != "") {
		db.alert($('#message').val(), 2, 2000);
	}
	else {
		init($('#tableName').val());
	}

})

var init = function (tableName) {
	var url = '/Query/GetTableStruct?tableName=' + tableName;
	var columns = [
        { field: 'FieldName', title: '字段名', width: 100, align: 'center', valign: 'center' },
        { field: 'FieldType', title: '字段类型', width: 100, align: 'center', valign: 'center' },
        { field: 'FieldDesc', title: '字段描述', align: 'center', width: 100, valign: 'middle' },
        { field: 'IsPK', title: '是否主键', align: 'center', width: 50, valign: 'middle', formatter: statusFormatter },
        { field: 'IsSelfGrowth', title: '自动增长', align: 'center', width: 50, valign: 'middle', formatter: statusFormatter },
        { field: 'IsNull', title: '可否为空', align: 'center', width: 50, valign: 'middle', formatter: statusFormatter },
        { field: 'FieldDefault', title: '默认值', align: 'center', width: 50, valign: 'middle' },
        { field: 'BytesOccupied', title: '占用字节', align: 'center', width: 50, valign: 'middle' },
        { field: 'FieldLength', title: '长度', align: 'center', width: 50, valign: 'middle' },
        { field: 'FieldBit', title: '小数位数', align: 'center', width: 50, valign: 'middle' },
	];
	db.load(url, "datagrid", columns);
}
//状态格式化
var statusFormatter = function (value, row) {
	html = '<span class="badge bg-red">否</span>'
	if (value == "True") html = '<span class="badge bg-green">是</span>'
	return html;
}