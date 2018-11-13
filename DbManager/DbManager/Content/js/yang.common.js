/********************************************************************************
** 描述: 菜单类库
** 作者：杨隆健  2018.11.1
*********************************************************************************/


var yang = {};
yang.plug = function () { }   //插件
yang.upload = function () { } // 上传组件
yang.table = function () { } //表格组件
$(function () {
    //列表查询（回车事件）
    $(document).keydown(function (e) {
        if (e.keyCode === 13 && $('#btnSearch').length > 0) {
            btnSearch.trigger('click');
            return false;
        }
    });
    //全局初始化复选框
    //yang.plug.initCheckbox();
    //全局查看图片
    //yang.showImg();
});


/********************************************************************************
** 描述:初始化ichek
*********************************************************************************/
yang.plug.initCheckbox = function () {
    $("input[type='checkbox'],input[type='radio']").iCheck({
        labelHover: false,
        cursor: true,
        checkboxClass: 'icheckbox_minimal-blue',
        radioClass: 'iradio_minimal-blue',
        increaseArea: '20%',
    });
}


/********************************************************************************
** 描述:layer遮罩层
*********************************************************************************/
yang.plug.startLoding = function () {
    layer.load(0, { shade: false }); //0代表加载的风格，支持0-2
}

/********************************************************************************
** 描述:关闭layer遮罩层
*********************************************************************************/
yang.plug.closeLoding = function () {
    layer.closeAll('loading'); //0代表加载的风格，支持0-2
}


/********************************************************************************
** 描述:layer成功提示框
*********************************************************************************/
yang.plug.success = function (msg, fn) {
    yang.plug.alert(msg, 1, 800, fn);
}
/********************************************************************************
** 描述:layer警告提示框
*********************************************************************************/
yang.plug.error = function (msg, fn) {
    yang.plug.alert(msg, 2, 800, fn);
}

/********************************************************************************
** 描述:layer提示弹窗
** 参数说明  msg : 提示内容 ; icon: icon 图标  ; time : 显示时间（ms）, fn:回调方法
*********************************************************************************/
yang.plug.alert = function (msg, icon, time, fn) {
    if (fn != undefined) {
        setTimeout(fn, time);
    }
    return layer.msg(msg, { icon: icon, time: time, shade: 0.8 });
}
/********************************************************************************
** 描述:layer确认提示弹窗
** 参数说明  text : 提示内容 ; fn: 函数
*********************************************************************************/
yang.plug.confirm = function (text, fn) {
    layer.confirm(text, { icon: 3, title: '提示' }, function (index) {
        fn();
        layer.close(index);
    });
}


/********************************************************************************
** 描述:表单重置
** 参数说明 fid 表单id
*********************************************************************************/
yang.plug.resetform = function (fid) {
    if (fid == undefined) {
        fid = 'frm';
    }
    $('input[type=hidden]').val('');
    $('[class="error"]').remove();
    $('#' + fid)[0].reset();
}





var $table;
/********************************************************************************
** 方法名称: ftcb.data.load
** 描述:数据加载
** 作者: Wilson
** 创建时间:201801101427
** 参数说明  Url: 路径  /  tableId : 要渲染的数据列表 id  / columns : 需要显示的列 / subConfig:子表配置 / pageSzie:第页大小
*********************************************************************************/
yang.table.load = function (url, tableId, columns, request, subConfig, pageSize) {
    var requestWay = request === undefined ? 'get' : 'post';
    $('#' + tableId + '').bootstrapTable('destroy');
    $table = $('#' + tableId + '').bootstrapTable({
        detailView: subConfig !== undefined ? true : false, //是否父子表
        method: requestWay,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        url: url,
        //height: $(window).height() - 290, //加这行会导致表头无法对齐问题(edit by linwb)和出现多余滚动条
        striped: false,
        pagination: true,
        pageNumber: 1,
        pageSize: pageSize !== undefined ? pageSize : 15,
        pageList: [5, 15, 25, 50, 100, 200],
        search: false,
        //queryParamsType: "undefined",
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
                yang.table.loadSub(index, row, $detail, subConfig);
            }
        }
    });
}

/********************************************************************************
** 方法名称: ftcb.data.loadSub
** 描述:绑定子列表
** 作者: Linwb
** 创建时间:2018-03-13
** 参数说明: index:父表当前行的行索引, row:父表当前行的Json数据对象, $detail:当前行下面创建的新行里面的td对象
** 参数说明: config:子表配置{ url:路径,  columns:数据列, keyFieldName:父级关联ID字段名 }
*********************************************************************************/
yang.table.loadSub = function (index, row, $detail, config) {
    var parentid = row[config.keyFieldName];
    var cur_table = $detail.html('<table></table>').find('table');
    $(cur_table).bootstrapTable({
        detailView: true, //父子表
        uniqueId: config.keyFieldName,
        method: 'post',
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        url: config.url + '?parentid=' + parentid,
        //height: $(window).height() - 290, //加这行会导致表头无法对齐问题(edit by linwb)和出现多余滚动条
        striped: true,
        pagination: true,
        pageNumber: 1,
        pageSize: 15,
        pageList: [5, 15, 25, 50, 100, 200],
        search: false,
        //queryParamsType: "undefined",
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
        columns: config.columns,
        formatLoadingMessage: function () {
            return "请稍等，正在加载中...";
        },
        //无线循环取子表，直到子表里面没有记录
        onExpandRow: function (index, row, $Subdetail) {
            ftcb.data.loadSub(index, row, $Subdetail, config);
        }
    });
}

var responseHandler = function (res) {
    return {
        "rows": res.D,
        "total": res.T
    };
}
function queryParams(params) {
    return {
        pageSize: params.limit,//每页多少条数据
        pageIndex: params.pageNumber,//请求第几页
    }
}



/********************************************************************************
** 方法名称: ftcb.data.refresh 
** 描述:刷新数据列表
** 作者: Wilson
** 创建时间:201801101427
** 参数说明  tableId : 要渲染的数据列表  如果tableid 不传，则默认 datagridId
*********************************************************************************/
yang.table.refresh = function (tableId) {
    if (tableId === '' || tableId === undefined) {
        tableId = 'datagrid';
    }
    $('#' + tableId).bootstrapTable('refresh');
}

/********************************************************************************
** 方法名称: ftcb.data.del 
** 描述:删除单条数据 // 支持多条
** 作者: Wilson
** 创建时间:201801101427
** 参数说明 : config {id:删除的id , url:执行的路径 , tableId:数据列表ID, keyFieldName:主键字段名称 } 
*********************************************************************************/
yang.table.del = function (config) {

    if (config.tableId != undefined && config.id === undefined) { // 多条
        var selects = $("#" + config.tableId).bootstrapTable('getSelections');
        var selectsArr = new Array();
        if (selects.length > 0) {
            selectsArr.push(selects);
        }
        //子表数据
        $("#" + config.tableId).find('table').each(function () {
            var _selects = $(this).bootstrapTable('getSelections');
            if (_selects.length > 0) {
                selectsArr.push(_selects);
            }
        });
        if (selectsArr.length === 0) {
            ftcb.alert('很遗憾，没找到您要删除的选项！', 5, 1000);
            return;
        }
        var ids = "";
        $(selectsArr).each(function (i, e) {
            if (e.length > 0) {
                $.each(e, function (n, m) {
                    var _id = config.keyFieldName !== undefined ? m[config.keyFieldName] : (m.Id === undefined ? m.ID : m.Id);
                    ids += _id !== undefined ? _id + ',' : '';
                });
            }
        });
        ids = ids.substring(0, ids.length - 1);
        layer.confirm("确认要删除？", { icon: 3, title: '提示' }, function (index) {
            $.ajax({
                type: config.type === undefined ? "get" : "post",
                url: config.url + "?id=" + ids,
                async: config.async === undefined ? true : false,
                success: function () {
                    ftcb.data.refresh(config.tableId);

                }
            });
            layer.close(index);
        });
    } else {
        layer.confirm("确认要删除？", { icon: 3, title: '提示' }, function (index) {
            $.ajax({
                type: config.type === undefined ? "get" : "post",
                url: config.url + "?id=" + config.id,
                async: config.async === undefined ? true : false,
                success: function () {
                    ftcb.data.refresh(config.tableId);
                }
            });
            layer.close(index);
        });
    }
}

/********************************************************************************
** 方法名称: ftcb.data.getSelectKey
** 描述:获取表格选中行的主键ID值
** 作者: Linwb
** 创建时间:2018-07-15
** 参数说明 : config {tableId:数据列表ID, keyFieldName:主键字段名称 } 
*********************************************************************************/
yang.table.getSelectKey = function (config) {
    if (config.tableId != undefined) { // 多条
        var selects = $("#" + config.tableId).bootstrapTable('getSelections');
        var selectsArr = new Array();
        if (selects.length > 0) {
            selectsArr.push(selects);
        }
        if (selectsArr.length === 0) {
            return '';
        }
        var ids = '';
        $(selectsArr).each(function (i, e) {
            if (e.length > 0) {
                $.each(e, function (n, m) {
                    var _id = config.keyFieldName !== undefined ? m[config.keyFieldName] : (m.Id === undefined ? m.ID : m.Id);
                    ids += _id !== undefined ? _id + ',' : '';
                });
            }
        });
        return ids;
    }
}

/********************************************************************************
** 方法名称: ftcb.data.add 
** 描述:删除单条数据 // 支持多条
** 作者: Wilson
** 创建时间:201801101427
** 参数说明 : url: 执行路径 ; frm : 表单名称
*********************************************************************************/
yang.table.add = function (url, frm) {
    if (ftcb.validate(frm)) {
        var arr = $('#' + frm).serializeArray();
        $.post(url, arr, function (res) {
            ftcb.alert(res, 1, 800);
            ftcb.data.refresh();
        });
        return true;
    }
    return false;
}