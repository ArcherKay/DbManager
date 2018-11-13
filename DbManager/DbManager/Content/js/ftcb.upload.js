
/********************************************************************************
** 类名称: ftcb.upload.js
** 描述:上传组件
** 作者: 许文鑫 (Wilson)
** 创建时间:2018-01-07
** 最后修改人:无
** 最后修改时间:无
*********************************************************************************/
var _ftcb = {};
_ftcb.data = function () { }
_ftcb.upload = function () { } // 上传组件

_ftcb.upload.render = function (config) {
    upload_container_render(config);
}

_ftcb.upload.reset = function (id) {
    return reset_upload_container(id);
}

_ftcb.upload.hasfile = function (id) {
    return has_file_container_info(id);
}

_ftcb.upload.getfileinfo = function (id) {
    return get_file_container_info(id);
}

_ftcb.upload.getfileinfo_desc = function (id) {
    return get_file_container_info_desc(id);
}


_ftcb.upload_assignment = function (imgs, cid) {
    upload_file_assignment(imgs, cid);
}

_ftcb.upload_assignment_infopic_desc = function (imgs, cid) {
    upload_assignmentdesc(imgs, cid);
}

// 赋值
var upload_file_assignment = function (imgs, cid) {

    if (cid === undefined) {
        cid = 0;
    }

    renderTable(cid, 0); // 构造 table 

    renderPreviewModal(cid); //构造预览窗口

    upload_file_build_tbody(imgs, cid); // 构造 tbody

}

// 赋值--描述
var upload_assignmentdesc = function (imgs, cid) {

    if (cid === undefined) {
        cid = 0;
    }

    renderTable(cid, 0); // 构造 table 

    // renderPreviewModaldesc(count); //构造预览窗口

    upload_file_build_tbody_desc(imgs, cid); // 构造 tbody

}
var upload_file_build_tbody = function (imgs, cid) {

    if (imgs == undefined || imgs == "") {
        reset_upload_container(cid);
        return false;
    }
    var imgsArr = imgs.split('|');
    var tbid = 'tb_file_' + cid;
    $.each(imgsArr, function (i, item) {
        if (item !== '') {
            var fileName = '';
            if (item.split('/').length == 5) {
                fileName = item.split('/')[4];
            } else {
                fileName = item.split('/')[3];
            }
            var guid = ftcb.newguid();
            var img = '<img style="width:30px;height:30px;" src="/Img/file_icon.svg"/>';
            var tr = '<tr id=' + guid + '><td style="text-align:center">' + img + '</td><td>' + fileName + '</td><td>#KB</td>&nbsp;<td style="text-align:center">#</td><td><a class="btn btn-danger btn-xs" onclick="remoTr(\'' + guid + '\',\'' + tbid + '\');"><i title="删除" class="fa fa-trash-o"></i>&nbsp;</a>&nbsp;<a class="btn btn-primary btn-xs" onclick="pre_event(\''+ item + '\',' + cid + ');"><i class="fa fa-eye" title="预览"></i>&nbsp;</a>&nbsp;<a class="btn btn-primary btn-xs" onclick="tr_move_up(this);"><i title="上移" class="fa fa-arrow-up"></i>&nbsp;</a>&nbsp;<a class="btn btn-primary btn-xs" onclick="tr_move_down(this);"><i title="下移" class="fa  fa-arrow-down"></i>&nbsp;</a>&nbsp;</a>&nbsp;<a class="btn btn-primary btn-xs" onclick="pic_desc(' + cid + ',\'' + guid + '\');"><i title="描述" class="fa fa-tags"></i>&nbsp;</a></td><td style="display:none;">' + item + '</td><td id="pic_desc_' + guid + '" style="display:none;"></td></tr>';

            $('#' + tbid + ' tbody').append(tr);
        }
    });
}

var upload_file_build_tbody_desc = function (imgs, cid) {

    if (imgs == undefined || imgs == "") {
        reset_upload_container(cid);
        return false;
    }

    var mode = imgs.split('@');
    var img = mode[0];
    var desc = mode[1];
    img = img.split('|');
    desc = desc.split('$');

    var tbid = 'tb_file_' + cid;
    var guid = '';
    var img1 = '<img style="width:30px;height:30px;" src="/Img/file_icon.svg"/>';

    for (var i = 0; i < img.length; i++) {


        var modalId = 'myPicDescModal_' + i;
        var modalLbId = 'myPicDescModalLabel_' + i;

        var modal = '<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog" aria-labelledby="' + modalLbId + '">' +
            '<div class="modal-dialog" role="document">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>' +
            '<h4 class="modal-title" id="myModalLabel">图片描述</h4>' +
            '</div>' +
            '<div class="modal-body">' +
            '<form id="pic_desc_frm" class="form-horizontal">' +
            '<div class="box-body">' +
            '<textarea class="form-control" id="pic_desc_txt_' + modalId + '" rows="3" placeholder="请输入图片描述"></textarea>' +
            '<div class="box-footer">' +
            '<button type="button" class="btn btn-info pull-right"  onclick="pic_desc_sure(' + i + ',this);">确定</button>' +
            '</div>' +
            '</div>' +
            '</form>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        $(document.body).append(modal);
    }

    for (var i = 0; i < img.length; i++) {

        guid = ftcb.newguid();
        var tr = '<tr id=' + guid + '><td style="text-align:center">' + img1 + '</td><td>' + contains(img[i]) + '</td><td>#KB</td>&nbsp;<td style="text-align:center">#</td><td><a class="btn btn-danger btn-xs" onclick="remoTr(\'' + guid + '\',\'' + tbid + '\');"><i title="删除" class="fa fa-trash-o"></i>&nbsp;</a>&nbsp;<a class="btn btn-primary btn-xs" onclick="pre_event(\'' + contains(img[i]) + '\',' + cid + ');"><i class="fa fa-eye" title="预览"></i>&nbsp;</a>&nbsp;<a class="btn btn-primary btn-xs" onclick="tr_move_up(this);"><i title="上移" class="fa fa-arrow-up"></i>&nbsp;</a>&nbsp;<a class="btn btn-primary btn-xs" onclick="tr_move_down(this);"><i title="下移" class="fa  fa-arrow-down"></i>&nbsp;</a>&nbsp;</a>&nbsp;<a class="btn btn-primary btn-xs" onclick="pic_desc1(' + i + ',\'' + guid + '\');"><i title="描述" class="fa fa-tags"></i>&nbsp;</a></td><td style="display:none;">' + contains(img[i]) + '</td><td id="pic_desc_' + guid + '" style="display:none;">' + desc[i] + '</td></tr>';

        $('#' + tbid + ' tbody').append(tr);
    }
}


var contains = function (img) {
    if (img.indexOf('upimg') != -1) {
        return img;
    }
    else {
        return img = '../upimg/' + img
    }
    return '';
}

// 图片预览
var pre_event = function (path, id) {
    $('#pre_view_' + id).attr('src', path);
    $('#myPicModal_' + id).modal();
}

// 清除行
var remoTr = function (t, tbId) {
    $('#' + t).remove();
    if ($('#' + tbId + ' tr').length === 1) { //  如果当前 tr 就剩 head 就隐藏掉 table
        $('#' + tbId + '').hide();
    }
}

// 在容器中渲染 table
var renderTable = function (id, isShow) {
    if (isShow == undefined) {
        isShow = 'style="display:none;"';
    }

    var tbFileId = 'tb_file_' + id;
    var fileContainerId = 'file_container_' + id;

    var table = '<hr />' +
        '<table name="ftcb_upload" id="' + tbFileId + '" ' + isShow + '" class="table table-hover table-bordered fixed-table-body table-striped">' +
        ' <thead>' +
        '<tr>' +
        ' <th>标识</th>' +
        ' <th>全称</th>' +
        ' <th>大小</th>' +
        '<th>后缀</th>' +
        '<th>操作</th>' +
        ' </tr>' +
        ' </thead>' +
        ' <tbody></tbody>' +
        ' </table>';
    $('#' + fileContainerId).html(table);
}

// 渲染图片预览窗口
var renderPreviewModal = function (id) {
    var modalId = 'myPicModal_' + id;
    var modalLbId = 'myPicModalLabel_' + id;
    var previewId = 'pre_view_' + id;

    var modal = '<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog" aria-labelledby="' + modalLbId + '">' +
        '<div class="modal-dialog" role="document">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>' +
        '<h4 class="modal-title" id="myModalLabel">图片预览</h4>' +
        '</div>' +
        '<div class="modal-body">' +
        '<form id="frm" class="form-horizontal">' +
        '<div class="box-body">' +
        '<img src="" id="' + previewId + '" style="height: 100%; width: 100%" />' +
        '</div>' +
        '</form>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    $(document.body).append(modal);
}



// 容器渲染
var upload_container_render = function (config) {

    var id = config.id;
    if (id === undefined) {
        id = '0';
    }
    var containerId = 'ftcb_file_upload_container_' + id; // 要装的容器

    // 构造基本元素
    var fileUploadInputId = 'fileupload_' + id;
    var filesArr = 'files' + id + '[]';
    var fileContainerId = 'file_container_' + id;

    // 基础组件样式
    var baseContainerHtml = '<span class="btn btn-primary fileinput-button">' +
        '<i class="glyphicon glyphicon-folder-open"></i>&nbsp;' +
        '<span>选择文件</span>' +
        '<input id="' + fileUploadInputId + '" type="file" name="' + filesArr + '" multiple>' +
        '</span>' +
        '<div id="' + fileContainerId + '"></div>';

    $('#' + containerId).html(baseContainerHtml);

    // 构造文件列表窗体
    renderTable(id);

    // 构造预览窗体
    renderPreviewModal(id);

    // 初始化上传事件
    init_upload_event(config);

    renderPicDescModal(id);
}

// 上传事件
var init_upload_event = function (config) {
    var id = config.id;
    var filuploadId = 'fileupload_' + id;
    var tableId = 'tb_file_' + id;


    if (config.isAllowResetFileName == undefined) { // 是否允许重置文件名称  0 -是 1-否 By Wislon Add 201804111722
        config.isAllowResetFileName = 0;
    } else {
        config.isAllowResetFileName = 1;
    }

    var url = config.url;
    if (url == undefined) {
        url = '../Handler/FileUpload.ashx?reset=' + config.isAllowResetFileName;
    }


    $('#' + filuploadId).fileupload({
        url: url,
        dataType: 'json',
        autoUpload: false,
        maxNumberOfFiles: 1,
        add: function (e, data) {
            if (config.size !== 0) { // 大小限制
                var size = data.originalFiles[0]['size'] / 1024;
                if (size > config.size) {
                    ftcb.alert('您上传的文件太大吓到服务器了', 2, 800);
                    return false;
                }
            }

            if (config.allow !== '') {  // 允许的文件类型

                //if (config.allow.indexOf(data.originalFiles[0]['type'].split('/')[1]) == -1 && data.originalFiles[0]['type'].split('/')[1].indexOf(config.allow) == -1) {
                //    ftcb.alert('您上传的文件本服务器不支持', 2, 800);
                //    return false;
                //}

                config.allow = config.allow.toLowerCase();

                //文件类型
                var fileType = [
                    { 'key': 'png', 'value': 'image/png' },
                    { 'key': 'bmp', 'value': 'image/bmp' },
                    { 'key': 'jpg', 'value': 'image/jpeg' },
                    { 'key': 'gif', 'value': 'image/gif' },
                    { 'key': 'docx', 'value': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
                    { 'key': 'xlsx', 'value': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
                    { 'key': 'pptx', 'value': 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
                    { 'key': 'doc', 'value': 'application/msword' },
                    { 'key': 'xls', 'value': 'application/vnd.ms-excel' },
                    { 'key': 'ppt', 'value': 'application/vnd.ms-powerpoint' },
                    { 'key': 'txt', 'value': 'text/plain' },
                    { 'key': 'zip', 'value': 'application/x-zip-compressed' },
                    { 'key': 'pdf', 'value': 'application/pdf' }
                ];

                //匹配正确类型
                var _allow = [];
                $(fileType).each(function (i, e) {
                    if ($.inArray(e.key, config.allow.split('|')) > -1) {
                        _allow.push(e.value);
                    }
                });

                if ($.inArray(data.originalFiles[0]['type'], _allow) === -1) {
                    ftcb.alert('您上传的文件本服务器不支持', 2, 800);
                    return false;
                }

            }

            if (config.limit !== 0) { // 数量限制
                if ($('#tb_file_' + config.id + ' tr').length > config.limit) {
                    ftcb.alert('当前上传数量已超出限制', 2, 800);
                    return false;
                }
            }

            data.submit();
            return true;
        },
        done: function (e, data) {
            $.each(data.result.files, function (index, file) { });
        },
        drop: function (e, data) { // 拖拽上传
            $.each(data.files, function (index, file) { });
        },
        always: function (e, data) { // 回调函数
            $('#' + tableId).show();

            var pictureExts = 'png|bmp|jpg|gif|jpeg|JPG|GIF|PNG|JPEG';
            var img = '<img style="width:30px;height:30px;" src="/Img/file_icon.svg"/>';

            if (pictureExts.indexOf(data.result.ext) > -1) {
                img = ' <img style="width:30px;height:30px;" src="/Img/pic_icon.svg" />';
            }

            var tb = '';
            tb += '<tr id=' + data.result.guid + '><td style="text-align:center">' + img + '</td><td class="ftcb_fileupload_title">' + data.result.name + '</td><td>' + data.result.size + ' KB</td>&nbsp;<td style="text-align:center">.' + data.result.ext + '</td><td><a class="btn btn-danger btn-xs" onclick="remoTr(\'' + data.result.guid + '\',\'' + tableId + '\');"><i title="删除" class="fa fa-trash-o"></i>&nbsp;</a>&nbsp;<a class="btn btn-primary btn-xs" onclick="pre_event(\'' + data.result.path + '\',' + id + ');"><i title="预览" class="fa fa-eye"></i>&nbsp;</a>&nbsp;<a class="btn btn-primary btn-xs" onclick="tr_move_up(this);"><i title="上移" class="fa fa-arrow-up"></i>&nbsp;</a>&nbsp;<a class="btn btn-primary btn-xs" onclick="tr_move_down(this);"><i title="下移" class="fa  fa-arrow-down"></i>&nbsp;</a>&nbsp;</a>&nbsp;<a class="btn btn-primary btn-xs" onclick="pic_desc(' + id + ',\'' + data.result.guid + '\');" ><i title="描述" class="fa fa-tags"></i>&nbsp;</a></td><td style="display:none;">' + data.result.path + '</td><td id="pic_desc_' + data.result.guid + '" style="display:none;"></td></tr>';

            $('#' + tableId + ' tbody').append(tb);
        },
        change: function (e, data) { // 操作触发事件
            if (config.limit !== 0) {
                if (data.files.length > config.limit) {
                    ftcb.alert('您一次上传太多文件了', 2, 800);
                    return false;
                }
            }
            $.each(data.files, function (index, file) { });
            return true;
        }
    }).prop('disabled', !$.support.fileInput)
        .parent().addClass($.support.fileInput ? undefined : 'disabled');
}

// 获取指定的文件容器信息
var get_file_container_info = function (id) {
    var desc = '';
    var files = '';
    var tb = $('#tb_file_' + id);
    tb.find('tr').each(function () {
        var tds = $(this).children();
        if (tds.eq(5).html() !== undefined) {
            files += tds.eq(5).html() + '|';
        }
        if (tds.eq(6).html() !== undefined)
            desc += tds.eq(6).html() + '$';
    });

    return files.substring(0, files.length - 1);
}

// 获取指定的文件容器信息
var get_file_container_info_desc = function (id) {
    var desc = '';
    var files = '';
    var tb = $('#tb_file_' + id);
    tb.find('tr').each(function () {
        var tds = $(this).children();
        if (tds.eq(5).html() !== undefined) {
            files += tds.eq(5).html() + '|';
        }
        if (tds.eq(6).html() !== undefined)
            desc += tds.eq(6).html() + '$';
    });

    return files.substring(0, files.length - 1) + '@' + desc.substring(0, desc.length - 1);
}

// 重置容器
var reset_upload_container = function () {
    $('[name="ftcb_upload"]').hide();
    $('[name="ftcb_upload"]  tr:not(:first)').html('');
}

//是否有上传文件
var has_file_container_info = function (id) {
    var tb;
    if (id !== undefined) {
        tb = $('#tb_file_' + id);
    } else {
        tb = $('[name="ftcb_upload"]');
    }
    var length = tb.find('tbody > tr').length;
    return length > 0;
}

//加入上下移 By Wilson 201804112205
// 上移 
var tr_move_up = function (obj) {
    var current = $(obj).parent().parent();
    var prev = current.prev();
    if (current.index() > 0) {
        current.insertBefore(prev);
    } else {
        ftcb.alert('到顶了', 5, 800);
    }
}
// 下移 
var tr_move_down = function (obj) {
    var current = $(obj).parent().parent();
    var next = current.next();
    if (next) {
        if (next.length === 0) {
            ftcb.alert('到底了', 5, 800);
        }
        current.insertAfter(next);
    }
}

var pic_desc_id = ''; // 全局变量，用来记录当前 id 的变化
var pic_desc = function (id, guid) {
    $('#pic_desc_txt_myPicDescModal_' + id).text();
    pic_desc_id = guid;
    var hisContent = $('#pic_desc_' + guid).text();
    $('#pic_desc_txt_myPicDescModal_' + id).val(hisContent);
    $('#myPicDescModal_' + id).modal();
}

var pic_desc1 = function (id, guid) {

    debugger;

    $('#pic_desc_txt_myPicDescModal_' + id).text();
    pic_desc_id = guid;
    var hisContent = $('#pic_desc_' + pic_desc_id).text();
    $('#pic_desc_txt_myPicDescModal_' + id).val(hisContent);
    $('#myPicDescModal_' + id).modal();
}

// 图片描述窗口 
var renderPicDescModal = function (id) {
    var modalId = 'myPicDescModal_' + id;
    var modalLbId = 'myPicDescModalLabel_' + id;

    var modal = '<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog" aria-labelledby="' + modalLbId + '">' +
        '<div class="modal-dialog" role="document">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>' +
        '<h4 class="modal-title" id="myModalLabel">图片描述</h4>' +
        '</div>' +
        '<div class="modal-body">' +
        '<form id="pic_desc_frm" class="form-horizontal">' +
        '<div class="box-body">' +
        '<textarea class="form-control" id="pic_desc_txt_' + modalId + '" rows="3" placeholder="请输入图片描述"></textarea>' +
        '<div class="box-footer">' +
        '<button type="button" class="btn btn-info pull-right"  onclick="pic_desc_sure(' + id + ',this);">确定</button>' +
        '</div>' +
        '</div>' +
        '</form>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    $(document.body).append(modal);
}

// 确认描述内容
var pic_desc_sure = function (id, t) {
    var content = $('#pic_desc_txt_myPicDescModal_' + id).val();
    $('#pic_desc_' + pic_desc_id).text(content);
    $('#myPicDescModal_' + id).modal('hide');
}