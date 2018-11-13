/********************************************************************************
** 类名称: ftcb.common.js
** 描述:常用工具脚本库
** 作者: 许文鑫 (Wilson)
** 创建时间:2018-01-07
** 最后修改人:无
** 最后修改时间:无
*********************************************************************************/



var $table;
var ftcb = {};
ftcb.data = function () { }
ftcb.upload = function () { } // 上传组件
ftcb.loading = function () { }


ftcb.data.notifymsg = function () {
    if (window.Notification && Notification.permission !== "denied") {
        Notification.requestPermission(function (status) {
            var notice = new Notification('新的消息', { body: '您有新的消息' });
            notice.onclick = function () {//单击消息提示框，进入浏览器页面
                alert(1)
            }
        });
    }
}

/********************************************************************************
** 方法名称: random
** 描述: 生成随机数
** 作者: Wilson
** 创建时间:2018-08-22
*********************************************************************************/
ftcb.data.random = function (minNum, maxNum) {
    minNum = parseInt(minNum);
    maxNum = parseInt(maxNum);
    return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
}

/********************************************************************************
** 方法名称: loading 
** 描述: 加入开启/关闭加载动画效果
** 作者: Wilson
** 创建时间:2018-08-21
*********************************************************************************/

ftcb.data.startLoding = function () {
    layer.load(0, { shade: false }); //0代表加载的风格，支持0-2
}

ftcb.data.closeLoding = function () {
    layer.closeAll('loading'); //0代表加载的风格，支持0-2
}

/********************************************************************************
** 方法名称: 获取 url 参数 
** 描述: 获取 url ？ 后面的地址参数
** 作者: Wilson
** 创建时间:2018-08-14
*********************************************************************************/

ftcb.data.request = function (name) {
    var request = getRequest();
    return request[name];
}


//抓取url参数
function getRequest() {
    var strs;
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") !== -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

/********************************************************************************
** 方法名称: 全局事件
** 描述: 初始化通用事件
** 作者: Linwb
** 创建时间:2018-02-09
*********************************************************************************/
$(function () {
    
     //列表查询（回车事件）
    $(document).keydown(function (e) {
        if (e.keyCode === 13 && $('#btnSearch').length > 0) {
            btnSearch.trigger('click');
            return false;
        }
    });

    //全局查看图片
    ftcb.showImg();

});

//是否系统配置的管理员
ftcb.isSysAdmin = function () {
    return $('#hdnIsAdmin').val();
}

//当前用户ID
ftcb.curUserId = function () {
    return $('#hdnCurUserId').val();
}

//获取当前用户是否管理员
ftcb.isAdmin = function () {
    var _isAdmin = $.cookie('JIEJU_ADMIN_ISADMIN');
    if (_isAdmin == null) {
        $.ajax({
            type: 'post',
            async: false,
            url: '/InfoManage/CurUserIsAdmin',
            success: function (res) {
                _isAdmin = res;
            },
            error: function (err) {
                _isAdmin = false;
            }
        });
    }
    return _isAdmin;
}

/********************************************************************************
** 方法名称: ftcb.data.load
** 描述:数据加载
** 作者: Wilson
** 创建时间:201801101427
** 参数说明  Url: 路径  /  tableId : 要渲染的数据列表 id  / columns : 需要显示的列 / subConfig:子表配置 / pageSzie:第页大小
*********************************************************************************/
ftcb.data.load = function (url, tableId, columns, request, subConfig, pageSize) {
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
                ftcb.data.loadSub(index, row, $detail, subConfig);
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
ftcb.data.loadSub = function (index, row, $detail, config) {
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
ftcb.data.refresh = function (tableId) {
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
ftcb.data.del = function (config) {

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
ftcb.data.getSelectKey = function (config) {
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
ftcb.data.add = function (url, frm) {
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

/********************************************************************************
** 方法名称: ftcb.alert 
** 描述:刷新数据列表
** 作者: Wilson
** 创建时间:201801101427
** 参数说明  msg : 提示内容 ; icon: icon 图标  ; time : 显示时间（ms）, fn:回调方法
*********************************************************************************/
ftcb.alert = function (msg, icon, time, fn) {
    if (fn != undefined) {
        setTimeout(fn, time);
    }
    return layer.msg(ftcb.format(msg), { icon: icon, time: time, shade: 0.8 });
}

/********************************************************************************
** 方法名称: ftcb.alertToUrl
** 描述: 显示提示消息并跳转
** 作者: Linwb
** 创建时间:2018-01-24
** 参数说明  msg : 提示内容 ; url: 跳转地址; icon: icon 图标  ; time : 显示时间（ms）
*********************************************************************************/
ftcb.alertToUrl = function (msg, url, icon, time) {
    setTimeout(function () {
        location.href = url;
    }, time);
    return layer.msg(ftcb.format(msg), { icon: icon, time: time, shade: 0.8 });
}

ftcb.format = function (msg) {
    return '<span style="color:black;">' + msg + '</span>';
}

/********************************************************************************
** 方法名称: ftcb.start_validate_frm 
** 描述:开启表单字段校验
** 作者: Wilson
** 创建时间:201801101427
** 参数说明  fid： 表单Id
*********************************************************************************/
ftcb.start_validate_frm = function (fid) {
    if (fid === '' || fid === undefined) {
        fid = 'frm';
    }
    $("#" + fid).validate();
}

/********************************************************************************
** 方法名称: ftcb.validate 
** 描述:开启表单字段校验
** 作者: Wilson
** 创建时间:201801101427
** 参数说明  fid： 表单Id
*********************************************************************************/
ftcb.validate = function (fid) {
    if (fid == undefined) {
        fid = 'frm';
    }
    if (!$("#" + fid).valid()) return false;

    return true;
}

/********************************************************************************
** 方法名称: ftcb.datepicker 
** 描述:日期空间 bootstrap datepicker
** 作者: Wilson
** 创建时间:201801101427
** 参数说明 文本ID
*********************************************************************************/
ftcb.datepicker = function (inputId) {
    $('#' + inputId).datepicker({
        autoclose: true,
        language: 'zh-CN',
        format: 'yyyy-mm-dd'
    });
}

/********************************************************************************
** 方法名称: ftcb.reset_frm 
** 描述:表单重置
** 作者: Wilson
** 创建时间:201801121125
** 参数说明 文本ID
*********************************************************************************/
ftcb.reset_frm = function (fid) {
    if (fid == undefined) {
        fid = 'frm';
    }
    $('input[type=hidden]').val('');
    $('[class="error"]').remove();
    $('#' + fid)[0].reset();
}


/********************************************************************************
** 方法名称: ftcb.dateformat 
** 描述:时间格式化 
** 作者: Wilson
** 创建时间:201801161238
** 参数说明 value - 需要格式化的值
*********************************************************************************/
ftcb.dateformat = function (value) {
    return formatTime(value);
}
ftcb.dateFormatNotTime = function (value) {
    return formatTime(value, 'yyyy-MM-dd');
}

Date.prototype.format = function (format) //author: meizz
{
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "h+": this.getHours(),   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}

var formatTime = function (val, format) {
    if (val != undefined && val != "") {
        var re = /-?\d+/;
        var m = re.exec(val);
        var d = new Date(parseInt(m[0]));
        return d.format(format != undefined ? format : "yyyy-MM-dd hh:mm:ss");
    }
    return "";
}

/********************************************************************************
** 方法名称: ftcb.ueditor
** 描述:加载富文本编辑器并返回编辑器实例
** 作者: Linwb
** 创建时间:20180115
** 参数说明:config(配置信息),
** 配置项说明:{ bindId: 绑定容器ID, [toolBar:模板类型(1,2,3)],[width: 宽度(设置'100%'可自适应宽度,要加引号)],
    [height: 高度],[content: 初始化内容],[customToolbar:自定义工具栏模板] }
*********************************************************************************/
ftcb.ueditor = function (config) {
    if (config == undefined) {
        return "NoConfig";
    }
    if (config.bindId == undefined) {
        return "NoBindId";
    }
    //工具栏模板
    var toolBarType = [];
    //简单模板
    var toolBarType1 = [[
        'fullscreen', 'bold', 'underline', 'strikethrough', '|', 'removeformat', '|', 'forecolor', 'backcolor', '|', 'justifyleft', 'justifycenter', 'justifyright',
        'justifyjustify', 'insertorderedlist', 'insertunorderedlist', '|', 'insertimage', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|', 'link', 'unlink', '|'
    ]];
    //一般模板
    var toolBarType2 = [[
        'fullscreen', 'source', '|', 'undo', 'redo', '|', 'bold', 'italic', '|', 'forecolor', 'backcolor', '|', 'superscript', 'subscript', '|',
        'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', 'insertorderedlist', 'insertunorderedlist', '|', 'indent', '|', 'removeformat',
        'formatmatch', 'autotypeset', '|', 'pasteplain', '|', 'rowspacingtop', 'rowspacingbottom', 'lineheight', '|', 'fontfamily', 'fontsize', '|',
        'imagenone', 'imageleft', 'imageright', 'imagecenter', '|', 'insertimage', 'insertvideo', 'map', 'horizontal', '|', 'link', 'unlink', '|', 'inserttable',
        'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols'
    ]];
    //完整模板
    var toolBarType3 = [[
        'fullscreen', 'source', '|', 'undo', 'redo', '|',
        'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'formatmatch', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist',
        'insertunorderedlist', 'selectall', 'cleardoc', '|', 'rowspacingtop', 'rowspacingbottom', 'lineheight', '|', 'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
        'directionalityltr', 'directionalityrtl', 'indent', '|', 'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
        'link', 'unlink', 'anchor', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|', 'emotion', 'scrawl', 'attachment', 'insertframe', 'template', 'background', '|',
        'date', 'time', 'spechars', 'wordimage', '|', 'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright',
        'mergedown', 'splittocells', 'splittorows', 'splittocols', 'charts', '|', 'print', 'preview', 'searchreplace', 'help', '|', 'insertvideo', 'removeformat', 'insertimage', 'autotypeset', 'horizontal'
    ]];
    //设置工具栏模板
    if (config.customToolbar !== undefined) {
        toolBarType = config.customToolbar;
    } else {
        switch (config.toolBar) {
            case 1:
                toolBarType = toolBarType1;
                break;
            case 2:
                toolBarType = toolBarType2;
                break;
            case 3:
                toolBarType = toolBarType3;
                break;
            default:
                toolBarType = toolBarType1;
                break;
        }
    }
    //实例化编辑器
    var editor = UE.getEditor(config.bindId, {
        iframeCssUrl: '/ueditor/themes/iframe.css',
        toolbars: toolBarType,
        initialContent: config.content !== undefined ? config.content : "",
        autoHeightEnabled: false,
        initialFrameWidth: config.width !== undefined ? config.width : 1000,
        initialFrameHeight: config.height !== undefined ? config.height : 500,
        pasteplain: false,
        wordCount: true,
        elementPathEnabled: false,
        //autoClearinitialContent: true,
        //imagePath: "/Upload/RTF/",
        //imageManagerPath: "/",
    });
    return editor;
}


/********************************************************************************
** 方法名称: ftcb.save
** 描述: 
** 作者: zyh
** 创建时间:20180117
** 修改时间:201801201720 By Wilson   - 调整验证 ftcb.validate(frm) 需要多加入参数 ，避免多表单情况验证出错
** 参数说明:
** 配置项说明:url,frm,callback(回调函数)，editor（富文本）,name(富文本Name)
*********************************************************************************/
ftcb.data.save = function (url, frm, callback, editor, name) {

    if (ftcb.validate(frm)) {

        var data = $('#' + frm).serializeArray();
        // console.log(data);
        if (editor != undefined) {
            var datatemp = new Array();
            for (var i = 0; i < data.length; i++) {
                if (data[i].name != name) {
                    datatemp.push(data[i]);
                }
                else {
                    datatemp.push({ name: name, value: encodeURIComponent(editor.getContent()) });
                }
            }
            data = datatemp;
        }

        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: data,
            success: function (res) {
                if (res.IsOk) {
                    ftcb.alert(res.Msg || '保存成功', 1, 800);
                    if (typeof callback === "function") {
                        callback();
                    }
                }
                else {
                    ftcb.alert(res.Msg || '保存失败', 1, 800);
                }
            },
            error: function (err) {
                //console.log(err);
                ftcb.alert('保存失败', 1, 800);
            }
        });

    }

}

/********************************************************************************
** 方法名称: ftcb.rangepicker
** 描述:加载时间范围控件
** 作者: Linwb
** 创建时间:2018/01/18
** 参数说明:配置信息 { bindId:绑定容器ID, class:类名, single:(true:单日历,false:范围日历),
    startDate:初始化开始时间, endDate:初始化结束时间, showTime:显示小时分钟, format:日期格式(YYYY-MM-DD HH:mm:ss) },
*********************************************************************************/
ftcb.rangepicker = function (config) {
    if (config == undefined) {
        return "NoConfig";
    }
    if (config.bindId == undefined) {
        return "NoBindId";
    }
    var picker = $("#" + config.bindId);
    picker.daterangepicker({
        startDate: config.startDate !== undefined ? config.startDate : moment().startOf('day'),
        endDate: config.endDate != undefined ? config.endDate : moment(),
        //minDate: '01/01/2012',    //最小时间  
        //maxDate: moment(), //最大时间   
        //dateLimit: {
        //    days: 30
        //}, //起止时间的最大间隔  
        singleDatePicker: config.single == true ? true : false,  //单日历或范围日历
        autoUpdateInput: true, //自动完成
        linkedCalendars: false,
        showDropdowns: true,
        showWeekNumbers: false, //是否显示第几周  
        timePicker: config.showTime !== undefined ? config.showTime : false, //是否显示小时和分钟  
        timePickerIncrement: 1, //时间的增量，单位为分钟  
        timePicker12Hour: false, //是否使用12小时制来显示时间  
        ranges: {
            //'最近1小时': [moment().subtract('hours',1), moment()],  
            '今日': [moment().startOf('day'), moment()],
            '昨日': [moment().subtract('days', 1).startOf('day'), moment().subtract('days', 1).endOf('day')],
            '最近7日': [moment().subtract('days', 6), moment()],
            '最近30日': [moment().subtract('days', 29), moment()]
        },
        opens: 'right', //日期选择框的弹出位置  
        buttonClasses: ['btn btn-default'],
        applyClass: 'btn-small btn-primary blue',
        cancelClass: 'btn-small',
        separator: ' to ',
        locale: {
            format: config.format !== undefined ? config.format : 'YYYY/MM/DD',//控件中from和to 显示的日期格式  
            applyLabel: '确定',
            cancelLabel: '取消',
            fromLabel: '起始时间',
            toLabel: '结束时间',
            customRangeLabel: '自定义',
            daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
                '七月', '八月', '九月', '十月', '十一月', '十二月'],
            firstDay: 1
        }
    }, function (start, end, label) {//格式化日期显示框  

    });
    //清空日期
    picker.siblings(".clearBtns").click(function () {
        $(picker).val("");
    });

    //var btns = [
    //    '<div style="padding-top:2px;text-align:right;">',
    //    '<button class="todayBtn btn btn-default btn-small btn-primary blue" type="button"> 今天</button>',
    //    '<button class="clearBtn btn btn-default btn-small btn-primary blue" type="button">清空</button>',
    //    '</div >'
    //].join('\n');

    //var pk = $('.daterangepicker');
    //if (config.single == true) {
    //    pk.find('.single').append(btns);
    //} else {
    //    pk.find('.range_inputs').css('text-align', 'right').append(btns);
    //}
    
    ////今天
    //pk.find('.todayBtn').on('click', function () {
    //    var curFormat = config.format !== undefined ? config.format : 'yyyy/MM/dd';
    //    var curDate = (new Date()).format(curFormat);
    //    $(picker).val(curDate);
    //    pk.slideUp(200);
    //});

    ////清空
    //pk.find('.clearBtn').on('click', function () {
    //    //$(picker).val('');
    //    //pk.slideUp(200);
    //    $('.clearBtns').trigger('click');
    //});

    return "NoConfig";
}

/**
 *  对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
 * 例子： 
 * (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
 * (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
 */
Date.prototype.format = function (fmt) { //author: meizz 
    "use strict";
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};


/********************************************************************************
** 方法名称: ftcb.formatStr
** 描述:格式化字符串
** 作者: Linwb
** 创建时间:2018/01/22
*********************************************************************************/
ftcb.formatStr = function () {
    if (arguments.length == 0)
        return null;
    var str = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        str = str.replace(re, arguments[i]);
    }
    return str;
}

/********************************************************************************
** 方法名称: ftcb.region
** 描述:加载地区联动下拉列表
** 作者: Linwb
** 创建时间:2018/01/22
** 参数说明:config(配置信息),
** 配置项说明:bindId(绑定容器ID),regionId(城市ID),cityName(城市名称),direction(排列方向:0水平,1垂直)
*********************************************************************************/
ftcb.region = function (config) {
    if (config == undefined) {
        return "NoConfig";
    }
    if (config.bindId == undefined) {
        return "NoBindId";
    }
    var provinceOption = '<option value="">省份</option>';
    var cityOption = '<option value="">城市</option>';
    var areaOption = '<option value="">县区</option>';

    var beginTag = config.direction == 0 ? '<div class="col-sm-2">' : '<p>';
    var endTag = config.direction == 0 ? '</div>' : '</p>';

    var html = [
        beginTag,
        '<select class="form-control ftcb-region" id="selProvince" name="selProvince">',
        provinceOption,
        '</select>',
        endTag,
        beginTag,
        '<select class="form-control ftcb-region " id="selCity" name="selCity">',
        cityOption,
        '</select>',
        endTag,
        beginTag,
        '<select class="form-control ftcb-region" id="selArea" name="selArea">',
        areaOption,
        '</select>',
        endTag
    ].join('\n');
    var region = $('#' + config.bindId);
    region.html(html);
    region.find('select').select2();
    var bindregion = function (select, parentId) {
        $.getJSON('/Handler/GetRegions', { parentId: parentId }, function (res) {
            createOption(select, res);
        });
    }
    var createOption = function (select, res, selval) {
        //console.log(selval);
        var option = '';
        $(res).each(function (i, e) {
            //console.log(e.Id);
            option += ftcb.formatStr('<option value="{0}"{1}>{2}</option>', e.Id, selval !== undefined && selval == e.Id ? ' selected="selected"' : '', e.CityName);
        });
        select.append(option);
    }
    bindregion(region.find('select').eq(0), 0);
    region.find('select').change(function () {
        var curType = $(this).prop("id");
        var curId = $(this).val();
        switch (curType) {
            case 'selProvince': //省
                region.find('select').eq(1).html(cityOption);
                region.find('select').eq(2).html(areaOption);
                if (curId > 0) {
                    bindregion(region.find('select').eq(1), curId);
                }
                break;
            case 'selCity': //市
                region.find('select').eq(2).html(areaOption);
                if (curId > 0) {
                    bindregion(region.find('select').eq(2), curId);
                }
                break;
            case 'selArea': //区县
                break;
        }
    });
    //初始化
    if (config.regionId !== undefined || config.cityName !== undefined) {
        var regionId = config.regionId !== undefined ? config.regionId : -1;
        var cityName = config.cityName !== undefined ? config.cityName : '';
        $.getJSON('/Handler/GetInitRegions', { regionId: regionId, cityName: cityName }, function (res) {
            res.reverse();
            //console.log(res);
            $(res).each(function (i) {
                //console.log($(this)[0].Key);
                createOption(region.find('select').eq(i), $(this)[0].Value, $(this)[0].Key);
            });
        });
    }
}

/********************************************************************************
** 方法名称: ftcb.getQueryString
** 描述:获取URL参数
** 作者: Linwb
** 创建时间:2018/01/23
** 参数说明:name(参数名)
*********************************************************************************/
ftcb.getQueryString = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return unescape(r[2]);
    return null;
}


/********************************************************************************
** 方法名称: ftcb.upload.render 
** 描述:上传组件渲染 
** 作者: Wilson
** 创建时间:201801241535
** 参数说明  如页面需要装载多个上传组件可传入指定 id 进行渲染
** config :  id:容器id  / multiple:是否多图 默认 false / limit: 限制上传数量
*********************************************************************************/

var defaultFileTypes = 'png|bmp|jpg|gif|docx|xlsx|pptx|doc|xls|ppt|txt|zip';
// 'png|bmp|jpg|gif|jpeg|JPG|GIF|PNG|JPEG|doc|xls|docx|csv|xlsx|vnd.ms-excel|msword|vnd.ms-powerpoint';

ftcb.upload.render = function (config) {
    var $config = {
        id: 0, // 容器id 默认自动渲染一个
        size: 0, // kb 默认不限制
        limit: 0, // 限制数量  默认不限制
        allow: defaultFileTypes // 允许类型 默认开放支持所有(图片/常规文档  禁掉sql/exe/等未知后缀)
    }
    if (config === undefined) {
        config = $config;
    }

    _ftcb.upload.render(config);
}

/********************************************************************************
** 方法名称: ftcb.upload.reset 
** 描述:弹窗的时候清掉旧的
** 作者: Wilson
** 创建时间:201801241535
** 参数说明  重置上传组件的值
*********************************************************************************/
ftcb.upload.reset = function () {
    _ftcb.upload.reset();
}

/********************************************************************************
** 方法名称: ftcb.upload.hasfile
** 描述:是否有上传文件
** 作者: Linwb
** 创建时间:2018-03-20
** 参数: { id: 控件ID，如果没有默认获取全部上传控件 }
*********************************************************************************/
ftcb.upload.hasfile = function (id) {
    return _ftcb.upload.hasfile(id);
}

/********************************************************************************
** 方法名称: ftcb.upload.getfiles 
** 描述:获取上传的文件信息
** 作者: Wilson
** 创建时间:201801241535
** 参数说明  如需要获取指定容器的文件信息可直接传入 id
*********************************************************************************/
ftcb.upload.getfiles = function (id) {
    return _ftcb.upload.getfileinfo(id);
}

/********************************************************************************
** 方法名称: ftcb.upload.getfiles_desc
** 描述:获取上传的文件信息和每个文件的描述信息
** 作者: Wilson
** 创建时间:201808161500
** 参数说明  如需要获取指定容器的文件信息可直接传入 id
*********************************************************************************/
ftcb.upload.getfiles_desc = function (id) {
    return _ftcb.upload.getfileinfo_desc(id);
}

/********************************************************************************
** 方法名称: ftcb.upload_assignment
** 描述:根据提供的值渲染到上传窗体
** 作者: Wilson
** 创建时间:201801301414
** 参数说明  imgs: 格式为  path0|path1|path2....  cid: 要渲染的容器id 如不传 则默认 0
*********************************************************************************/
ftcb.upload_assignment = function (imgs, cid) {
    _ftcb.upload_assignment(imgs, cid);
}

/********************************************************************************
** 方法名称: ftcb.upload_assignment_desc
** 描述:获取上传的文件信息和每个文件的描述信息
** 作者: jakcy
** 创建时间:201808161500
** 参数说明 如需要获取指定容器的文件信息可直接传入 id
*********************************************************************************/
ftcb.upload_assignment_desc = function (imgs, cid) {
    _ftcb.upload_assignment_infopic_desc(imgs, cid);
}


/********************************************************************************
** 方法名称: ftcb.GetSelectIds
** 描述: 获取选择的ID
** 作者: 
** 创建时间:2018/01/22
** 参数说明: 
** 配置项说明: 
*********************************************************************************/
ftcb.getSelectIds = function (config) {
    if (config != undefined) {
        var selects = $("#" + config.tableId).bootstrapTable('getSelections');
        if (selects.length === 0) {

            return "";
        }
        var ids = "";
        $.each(selects, function (n, m) {
            ids += (m.Id == undefined ? m.ID : m.Id) + ",";
        });
        ids = ids.substring(0, ids.length - 1);
        return ids;
    }
}

/********************************************************************************
** 方法名称: ftcb.modal
** 描述:bootstrap 居中弹窗
** 作者: Linwb
** 创建时间: 2018-01-25
** 参数说明: modalId 模态窗体ID, validator:jquery表单验证对象, clearFile:是否清空上传域 
*********************************************************************************/
ftcb.modal = function (modalId, validator, clearFile) {
    var modtal = $('#' + modalId);
    //bootstrap居中
    modtal.on('show.bs.modal', function () {
        var $this = $(this);
        var $modal_dialog = $this.find('.modal-dialog');
        // 关键代码，如没将modal设置为 block，则$modala_dialog.height() 为零
        $this.css('display', 'block');
        $modal_dialog.css({ 'margin-top': Math.max(0, ($(window).height() - $modal_dialog.height()) / 2) });
    });
    //清空表单
    modtal.on('hide.bs.modal', function () {
        var $this = $(this);
        $this.find('input:text,input:hidden,input:password,textarea').val('');
        $this.find('select').each(function () {
            $(this).find('option:first').prop('selected', true);
        });
        $this.find('input:radio').each(function () {
            $(this).prop('checked', false);
        });
        $this.find('input:file').each(function () {
            $(this).after($(this).clone().val(""));
            $(this).remove();
        });
        //是否清空上传域(默认true)
        clearFile = clearFile !== undefined ? clearFile : true;
        if (clearFile) {
            try {
                ftcb.upload.reset(); //清空上传域
            } catch (ex) {
            }
        }
        //清除验证状态
        if (validator !== undefined && validator !== null) {
            validator.resetForm();
        }
    });
    //延时加载，防止样式无效
    setTimeout(function () {
        modtal.modal();
    }, 200);
    return modtal;
}


/********************************************************************************
** 方法名称: ftcb.newguid
** 描述:生成36位GUID
** 作者: Wilson
** 创建时间: 2018-01-30
** 参数说明:  #
*********************************************************************************/
ftcb.newguid = function guid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";
    var uuid = s.join("");
    return uuid;
}

/********************************************************************************
** 方法名称: ftcb.searchFormToParams
** 描述: 拼接查询表单URL参数（后台获取参数直接使用表单的 name 属性）
** 注意：如果查询方式比较特殊，不适用此方法）
** 作者: Linwb
** 创建时间: 2018-02-06
** 参数说明: formId:查询表单Id
*********************************************************************************/
ftcb.searchFormToParams = function (formId) {
    formId = formId !== undefined ? formId : 'formSearch';
    var params = $('#' + formId).serializeArray();
    var urlParams = '';
    $(params).each(function (i, e) {
        urlParams += urlParams.length > 0 ? '&' : '';
        urlParams += ftcb.formatStr('{0}={1}', e.name, e.value);
    });
    return urlParams;
}

/********************************************************************************
** 方法名称: ftcb.download
** 描述: 文件下载
** 作者: Linwb
** 创建时间: 2018-03-02
** 参数说明: { filePath:服务端请求文件路径, fileName:客户端下载要显示的文件名, method:请求方式 }
*********************************************************************************/
ftcb.download = function (config) {
    if (config.method == 'get') {
        //GET方式请求
        var downloadUrl = ftcb.formatStr('/Handler/Download?filePath={0}&fileName={1}', config.filePath, config.fileName);
        var iframeDownload = $('#iframeDownload');
        if (iframeDownload.length > 0) {
            iframeDownload.attr('src', downloadUrl)
        } else {
            $('body').append(ftcb.formatStr('<iframe id="iframeDownload" src="{0}"></iframe>', downloadUrl));
        }
    } else {
        //POST方式请求
        var formFtcbDownload = $('#formFtcbDownload');
        if (formFtcbDownload.length == 0) {
            var formHtml = ['<form id="formFtcbDownload" name="formFtcbDownload" action="/Handler/Download" method="post">',
                '<input type="hidden" id="hdnFilePath" name="hdnFilePath" />',
                '<input type="hidden" id="hdnFileName" name="hdnFileName" />',
                '</form>'].join('\n');
            $('body').append(formHtml);
            formFtcbDownload = $('#formFtcbDownload');
        }
        formFtcbDownload.find('#hdnFilePath').val(config.filePath);
        formFtcbDownload.find('#hdnFileName').val(config.fileName);
        formFtcbDownload.submit();
    }
}

/********************************************************************************
** 方法名称: ftcb.showImg
** 描述: 查看图片
** 作者: Linwb
** 创建时间: 2018-03-15
** 使用说明: 只需在要查看的<img>标签上添加类（img-layout-show）即可
*********************************************************************************/
ftcb.showImg = function () {
    $(document).on('mouseenter', '.img-layout-show', function () {
        $(this).css({ 'cursor': 'pointer', 'border': 'solid 1px red' });
    });
    $(document).on('mouseleave', '.img-layout-show', function () {
        $(this).css({ 'border': 'none' });
    });
    $(document).on('click', '.img-layout-show', function () {
        var src = $(this).attr('src');
        var imgShow = $('#imgLayoutShow');
        imgShow.html(ftcb.formatStr('<img id="imgLayoutShow" src="{0}" onerror="javascript:this.src=\'/Img/Empty/70x70.png\'" style="max-width:550px;" />', src));
        //imgShow.attr('src', src);
        var modal = ftcb.modal('imgLayoutShowModal');
        modal.on('hide.bs.modal', function () {
            imgShow.attr('src', '/Img/Empty/70x70.png');
        });
    });
}

/********************************************************************************
** 方法名称: ftcb.loading.init
** 描述: 初始化加载等待窗口
** 作者: Linwb
** 创建时间: 2018-03-20
** 参数说明: { text: 提示文字 }
*********************************************************************************/
ftcb.loading.init = function (config) {
    ftcb.loading.reset();
    ftcb.loading.setparam({ index: 0, text: config.text });
    var ftcb_loading = $('.ftcb_loading');
    var overlay = $(ftcb_loading).find('.overlay');
    var top = $(window).height() / 2 - overlay.height() / 2;
    overlay.parent().css('margin-top', top);
    ftcb_loading.fadeIn(200);
}

/********************************************************************************
** 方法名称: ftcb.loading.reset
** 描述: 重置加载等待窗口
** 作者: Linwb
** 创建时间: 2018-03-20
*********************************************************************************/
ftcb.loading.reset = function () {
    $('.ftcb_loading').find('.overlay').hide(0).each(function () {
        $(this).find('small').text('...');
    });
}

/********************************************************************************
** 方法名称: ftcb.loading.setparam
** 描述: 设置加载等待窗口内容并显示
** 作者: Linwb
** 创建时间: 2018-03-20
** 参数说明: { index:显示状态(0:初始化, 1:成功, 2:失败) text: 提示文字 }
*********************************************************************************/
ftcb.loading.setparam = function (config) {
    $('.ftcb_loading').find('.overlay').eq(config.index).find('small').text(config.text).parent().fadeIn(200);
}

/********************************************************************************
** 方法名称: ftcb.loading.success
** 描述: 加载等待窗口显示成功
** 作者: Linwb
** 创建时间: 2018-03-20
** 参数说明: { text: 提示文字 }
*********************************************************************************/
ftcb.loading.success = function (config) {
    ftcb.loading.reset();
    ftcb.loading.setparam({ index: 1, text: config.text });
    setTimeout(function () {
        ftcb.loading.hide();
        if (config.url !== undefined) {
            location.href = config.url;
        }
    }, 1500);
}

/********************************************************************************
** 方法名称: ftcb.loading.fail
** 描述: 加载等待窗口显示失败
** 作者: Linwb
** 创建时间: 2018-03-20
** 参数说明: { text: 提示文字 }
*********************************************************************************/
ftcb.loading.fail = function (config) {
    ftcb.loading.reset();
    ftcb.loading.setparam({ index: 2, text: config.text });
    setTimeout(function () {
        ftcb.loading.hide();
    }, 1500);
}

/********************************************************************************
** 方法名称: ftcb.loading.hide
** 描述: 隐藏加载等待窗口
** 作者: Linwb
** 创建时间: 2018-03-20
*********************************************************************************/
ftcb.loading.hide = function (fn) {
    ftcb.loading.reset();
    $('.ftcb_loading').fadeOut(200);
    if (fn !== undefined) {
        fn();
    }
}

/********************************************************************************
** 方法名称: ftcb.icheck
** 描述:实例化icheck样式，需要引入icheck样式和脚本
** 作者: 曾益川
** 创建时间:2018/01/23
** 参数说明:bindClass(绑定容器Class)
*********************************************************************************/
ftcb.icheck = function (bindClass) {
    if (bindClass === undefined) {
        return 'NoBindClass';
    }
    var checkItem = $('.' + bindClass);
    checkItem.iCheck({
        checkboxClass: 'icheckbox_minimal-blue',
        radioClass: 'iradio_minimal-blue'
    });
}

/********************************************************************************
** 方法名称: ftcb.getLetterOption
** 描述: 获取字母下拉选项
** 作者: Linwb
** 创建时间: 2018-03-23
** 参数: { capType:大小写类型(upper/lower) }
*********************************************************************************/
ftcb.getLetterOption = function (config) {
    var upperLetter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    var lowerLetter = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    var currentLetter = upperLetter;
    if (config.capType !== undefined) {
        if (config.capType === 'upper') {
            currentLetter = upperLetter;
        }
        if (config.capType === 'lower') {
            currentLetter = lowerLetter;
        }
    }
    var option = '';
    $(currentLetter).each(function (i, e) {
        option += ftcb.formatStr('<option value="{0}">{0}</option>', e);
    });
    if (config.selId !== undefined) {
        $('#' + config.selId).html(option);
    }
}

/********************************************************************************
** 方法名称: HtmlUtil
** 描述: html转换操作通用方法
** 作者: Linwb
** 创建时间: 2018-03-29
*********************************************************************************/
ftcb.htmlUtil = {
    /*1.用浏览器内部转换器实现html转码*/
    htmlEncode: function (html) {
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement("div");
        //2.然后将要转换的字符串设置为这个元素的innerText(ie支持)或者textContent(火狐，google支持)
        (temp.textContent != undefined) ? (temp.textContent = html) : (temp.innerText = html);
        //3.最后返回这个元素的innerHTML，即得到经过HTML编码转换的字符串了
        var output = temp.innerHTML;
        temp = null;
        return output;
    },
    /*2.用浏览器内部转换器实现html解码*/
    htmlDecode: function (text) {
        //1.首先动态创建一个容器标签元素，如DIV
        var temp = document.createElement("div");
        //2.然后将要转换的字符串设置为这个元素的innerHTML(ie，火狐，google都支持)
        temp.innerHTML = text;
        //3.最后返回这个元素的innerText(ie支持)或者textContent(火狐，google支持)，即得到经过HTML解码的字符串了。
        var output = temp.innerText || temp.textContent;
        temp = null;
        return output;
    },
    /*3.用正则表达式实现html转码*/
    htmlEncodeByRegExp: function (str) {
        var s = "";
        if (str.length == 0) return "";
        s = str.replace(/&/g, "&amp;");
        s = s.replace(/</g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        s = s.replace(/ /g, "&nbsp;");
        s = s.replace(/\'/g, "&#39;");
        s = s.replace(/\"/g, "&quot;");
        return s;
    },
    /*4.用正则表达式实现html解码*/
    htmlDecodeByRegExp: function (str) {
        var s = "";
        if (str.length == 0) return "";
        s = str.replace(/&amp;/g, "&");
        s = s.replace(/&lt;/g, "<");
        s = s.replace(/&gt;/g, ">");
        s = s.replace(/&nbsp;/g, " ");
        s = s.replace(/&#39;/g, "\'");
        s = s.replace(/&quot;/g, "\"");
        return s;
    }
};

/********************************************************************************
** 方法名称: ftcb.backToTop
** 描述: 回到页面顶部
** 作者: Linwb
** 创建时间: 2018-03-29
** 参数说明: time:动画时间(单位:毫秒,默认500毫秒)
*********************************************************************************/
ftcb.backToTop = function (time) {
    $('html,body').animate({
        scrollTop: 0
    }, time !== undefined ? time : 500);
}

/********************************************************************************
** 方法名称: ftcb.confirm
** 描述: 显示确认窗口
** 作者: Linwb
** 创建时间: 2018-03-29
** 参数说明: text:提示消息, fn:确认OK时执行的方法
*********************************************************************************/
ftcb.confirm = function (text, fn) {
    layer.confirm(text, { icon: 3, title: '提示' }, function (index) {
        fn();
        layer.close(index);
    });
}