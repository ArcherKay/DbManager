

var $table;
var db = {};



//弹窗提示
db.alert = function (msg, icon, time, fn) {
    if (fn != undefined) {
        setTimeout(fn, time);
    }
    return layer.msg(msg, { icon: icon, time: time, shade: 0.8 });
}
db.success = function (msg) {
    db.alert(msg, 1, 1000);
}
db.error = function (msg) {
    db.alert(msg, 2, 1000);
}
db.confirm = function (msg, fn) {
    layer.confirm(msg, { icon: 3, title: '提示' }, function (index) {
        fn();
        layer.close(index);
    });
}


//遮罩层
db.startLoding = function () {
    layer.load(0, { shade: 0.8 }); //0代表加载的风格，支持0-2
}

db.closeLoding = function () {
    layer.closeAll('loading'); //0代表加载的风格，支持0-2
}




/*数据表格加载
** 描述:数据加载
** 参数说明  Url: 路径  /  tableId : 要渲染的数据列表 id  / columns : 需要显示的列 / pageSzie:第页大小/fn 渲染函数
*/
db.load = function (url, tableId, columns, pageSize, request) {
    var requestWay = request === undefined ? 'get' : 'post';
    $('#' + tableId + '').bootstrapTable('destroy');
    $table = $('#' + tableId + '').bootstrapTable({
        method: requestWay,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        url: url,
        striped: true,//隔行样式
        pagination: true,
        pageNumber: 1,
        pageSize: pageSize !== undefined ? pageSize : 20,
        pageList: [20, 50, 100],
        search: false,
        queryParams: function queryParams(params) {   //设置查询参数  
            var param = {
                pageNumber: params.offset / params.limit + 1,
                pageSize: params.limit
            };
            return param;
        },
        sidePagination: "server",
        responseHandler: responseHandler,
        showColumns: false,
        minimunCountColumns: 2,
        columns: columns,
        formatLoadingMessage: function () {
            return "请稍等，正在加载中...";
        },
        onExpandRow: function (index, row, $detail) {
            if (subConfig !== undefined) {
                admin.data.loadSub(index, row, $detail, subConfig);
            }
        },
        onPostBody: function () {
            db.initIcheck();  
            $('input[name="btSelectAll"]').on('ifClicked', function (event) {
                var tid=$(this).closest('table').attr('id')
                if (!$(this).prop('checked')) {
                    $('#' + tid + ' tr').find('input[type="checkbox"]').each(function () {
                        $(this).iCheck('check');
                        $(this).closest('tr').addClass('selected');
                    });
                }
                else {
                    $('#' + tid + ' tr').find('input[type="checkbox"]').each(function () {
                        $(this).iCheck('uncheck');
                        $(this).closest('tr').removeClass('selected');
                    });
                }
            });
            $('input[type="checkbox"]').on('ifClicked', function (event) { //ifCreated 事件应该在插件初始化之前绑定
                if (!$(this).prop('checked')) {
                    $(this).closest('tr').addClass('selected');
                }
                else {
                    $(this).closest('tr').removeClass('selected');
                }
            });
        }
    });
}
//后台回参
var responseHandler = function (res) {
    return {
        "rows": res.D,
        "total": res.T
    };
}


//获取勾选的值 
//表格id，/字段名 fieldName   修该方法（引用icheck 导致state为undefined）
db.getSelectKey = function (tableId, fieldName) {
    var ids = '';
    if (tableId != undefined) {
        var tr = $("#" + tableId + " tbody").find("tr.selected")
        if ($(tr).length == 0) {
            return '';
        }
        var selectsArr = new Array();
        for (var i = 0; i < $(tr).length; i++) {
            var index = $(tr).eq(i).data("index");
            var data = $("#" + tableId).bootstrapTable('getData')[index];
            selectsArr.push(data);
        }
        if (selectsArr.length === 0) {
            return '';
        }
        for (var j = 0; j < selectsArr.length; j++) {
            var _id = fieldName !== undefined ? selectsArr[j][fieldName] : (m.Id === undefined ? m.ID : m.Id);
            ids += _id !== undefined ? _id + ',' : '';
        }
        if (ids !== "") {
            ids = ids.substring(0, ids.length - 1);
        } 
    }
    return ids;
}


//初始化icheck
db.initIcheck = function () {
    $("input[type='checkbox'],input[type='radio']").iCheck({
        labelHover: false,
        cursor: true,
        checkboxClass: 'icheckbox_flat-blue',
        radioClass: 'icheckbox_flat-blue',
        increaseArea: '20%',
    });
}