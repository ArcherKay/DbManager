function AddTr(tab, row) {
    var trHtml = "<tr align='center'>" +
        "<td width='10%'><input type='checkbox' name='ckb'/></td>" +
        "<td width='20%'><input type='text' name='f_name'/></td>" +
        "<td width='27%'><input type='text' name='f_length'/></td>" +
        "<td width='27%'><input type='text' name='f_desc'/></td></tr>";
    AddTr2(tab, row, trHtml);
}

function AddTr2(tab, row, trHtml) {
    var $tr = $("#" + tab + " tr").eq(row);
    if ($tr.size() == 0) {
        alert("指定的table id或行数不存在！");
        return;
    }
    $tr.after(trHtml);
}
//changes
//数据类型关键字过滤
var keyFilter = "int|decimal|tinyint|money|long|bigint|byte|short|char|decimal(19,5)|decimal(18,2)";

//生成
function Build() {
    $("#spWinTitle").text("SQL脚本预览窗口");
    var sqlBody = "";
    sqlBody = "<pre><code class=\"language-sql\">IF NOT EXISTS (select * from sysobjects where id = object_id(N'[" + $("#inpTableName").val() + "]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)  <br/>";
    sqlBody += "Begin<br/>";
    sqlBody += " Create table " + $("#inpTableName").val() + "<br/>(<br/>";
    sqlBody += "&nbsp;&nbsp;&nbsp;Id int Identity(1,1) NOT NULL,<br/>";
    var excute = "";
    excute = "EXECUTE sp_addextendedproperty N'MS_Description', '" + $("#inpTableDesc").val() + "', N'user', N'dbo', N'table', N'" + $("#inpTableName").val() + "', NULL, NULL <br/>";
    excute += "EXECUTE sp_addextendedproperty N'MS_Description', '主键ID', N'user', N'dbo', N'table', N'" + $("#inpTableName").val() + "', N'column', N'Id' <br/>";

    var index = "";
    index = "Create Index Ix_" + $("#inpTableName").val() + "_" + $("#inpIndexName").val() + "  On " + $("#inpTableName").val() + "(" + $("#inpIndexName").val() + ");<br/>";
    index += "END ";
    var sqlFoot = "";
    var defaultvalue = "";
    $("#tb").find("tr").each(function () {
        var tds = $(this).children();
        var name = tds.eq(1).find("input").val();
        var type = tds.eq(2).find("input").val();
        var desc = tds.eq(3).find("input").val();
        if (name != undefined) {
            if (type.toLowerCase() == "datetime") {
                defaultvalue = "getdate()";
            } else if (keyFilter.indexOf(type.toLowerCase()) == -1) {
                defaultvalue = "''";
            } else {
                defaultvalue = "0";
            }
            sqlBody += "&nbsp;&nbsp;&nbsp;" +
                name
                + " "
                + type + " Constraint DF_" + $("#inpTableName").val() + "_"
                + name + " default(" + defaultvalue + ") NOT NULL,<br/>";

            excute += "EXECUTE sp_addextendedproperty N'MS_Description', '" + desc + "', N'user', N'dbo', N'table', N'" + $("#inpTableName").val() + "', N'column', N'" + name + "' <br/>";
        }
    });
    //sqlBody = sqlBody.substring(0, sqlBody.length - 1);
    sqlBody += "&nbsp;&nbsp;&nbsp;AddTime DateTime Constraint DF_" + $("#inpTableName").val() + "_AddTime default(getdate()) NOT NULL,<br/>";
    sqlBody += "&nbsp;&nbsp;&nbsp;ModifyTime DateTime Constraint DF_" + $("#inpTableName").val() + "_ModifyTime default(getdate()) NOT NULL,<br/>";
    sqlBody += "CONSTRAINT [PK_" + $("#inpTableName").val() + "] PRIMARY KEY CLUSTERED <br/>";
    sqlBody += "(<br/>";
    sqlBody += "&nbsp;&nbsp;&nbsp;[Id] ASC<br/>";
    sqlBody += ")WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]";

    excute += "EXECUTE sp_addextendedproperty N'MS_Description', '添加时间', N'user', N'dbo', N'table', N'" + $("#inpTableName").val() + "', N'column', N'AddTime' <br/>";
    excute += "EXECUTE sp_addextendedproperty N'MS_Description', '修改时间', N'user', N'dbo', N'table', N'" + $("#inpTableName").val() + "', N'column', N'ModifyTime' <br/>";
    sqlBody += "<br/>)ON [PRIMARY]<br/>";

    $("#spCreateSql").html(sqlBody + excute + "<br/>" + index + " </code></pre>");
}

function delTr2() {
    delTr('ckb');
}

function delTr(ckb) {
    //获取选中的复选框，然后循环遍历删除
    var ckbs = $("input[name=" + ckb + "]:checked");
    if (ckbs.size() == 0) {
        alert("没有可选中行");
        return;
    }
    ckbs.each(function () {
        $(this).parent().parent().remove();
    });
}

function SqlView() {
    $("#spWinTitle").text("创建表示例");
    var head = " <pre><code class=\"language-sql\">";
    var sql = "";
    sql += "--创建表示例<br/>";
    sql += "--1.  必须有主键Id字段.<br/>";
    sql += "--2. 原则上字段要加默认值,default(''),数值为default(0),所有字段的值不允许为NULL.除非某些特例，比如时间。<br/>";
    sql += "--3. 字段默认值约束要加约束名,格式为DF_表名_字段名.<br/>";
    sql += "--4. 表的描述和字段描述都要写清楚.<br/>";
    sql += "--5. 适当创建索引,格式为Ix_表名_字段名.比如,外键一定要加索引.<br/>";
    sql += "--6.  AddTime,ModifyTime字段一定要有,最后修改时间字段看具体情况可选择性添加.<br/>";
    sql += "IF NOT EXISTS (select * from sysobjects where id = object_id(N'[ReportTask]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)  <br/>";
    sql += "Begin <br/>";
    sql += "Create table ReportTask<br/>";
    sql += "(<br/>";
    sql += "Id int Identity(1,1) NOT NULL,<br/>";
    sql += "FxsNo varchar(20) Constraint DF_ReportTask_FxsNo default(''),<br/>";
    sql += "EShopId int Constraint DF_ReportTask_EShopId default(0),<br/>";
    sql += "Status int Constraint DF_ReportTask_Status default(0),<br/>";
    sql += "AddTime DateTime Constraint DF_ReportTask_AddTime default(getdate()),<br/>";
    sql += "ModifyTime DateTime Constraint DF_ReportTask_ModifyTime default(getdate()),<br/>";
    sql += " CONSTRAINT [PK_ReportTask] PRIMARY KEY CLUSTERED<br/>";
    sql += "(<br/>";
    sql += "&nbsp;&nbsp;&nbsp;[Id] ASC<br/>";
    sql += ")WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]<br/>";
    sql += "<br/>) ON [PRIMARY]";

    var sql2 = "<br/>EXECUTE sp_addextendedproperty N'MS_Description', '亚马逊报告任务表', N'user', N'dbo', N'table', N'ReportTask', NULL, NULL  --表名<br/> " +
        "EXECUTE sp_addextendedproperty N'MS_Description', '主键ID', N'user', N'dbo', N'table', N'ReportTask', N'column', N'Id'<br/> " +
        "EXECUTE sp_addextendedproperty N'MS_Description', '分销商编号', N'user', N'dbo', N'table', N'ReportTask', N'column', N'FxsNo' <br/>" +
        "EXECUTE sp_addextendedproperty N'MS_Description', '店铺ID', N'user', N'dbo', N'table', N'ReportTask', N'column', N'EShopId'<br/> " +
        "EXECUTE sp_addextendedproperty N'MS_Description', '报告请求状态 默认：0：已提交 1：已完成 2：已失败', N'user', N'dbo', N'table', N'ReportTask', N'column', N'Status'<br/> " +
        "EXECUTE sp_addextendedproperty N'MS_Description', '添加时间', N'user', N'dbo', N'table', N'ReportTask', N'column', N'AddTime'<br/>" +
        "EXECUTE sp_addextendedproperty N'MS_Description', '最后修改时间', N'user', N'dbo', N'table', N'ReportTask', N'column', N'ModifyTime'";
    var index = "<br/>--创建索引<br/>Create Index Ix_ReportTask_EShopId  On ReportTask(EShopId);<br/>";
    index += "END ";
    var foot = " </code></pre>";
    $("#spCreateSql").html(head + sql + sql2 + index + foot);
}

function SqlView2() {
    $("#spWinTitle").text("增加字段示例");
    var head = " <pre><code class=\"language-sql\">";
    var sql = "";
    sql += "--增加字段示例<br/>";
    sql += "--1. 原则上字段要加默认值,字符串为default(''),数值为default(0),所有字段的值不允许为NULL.除非某些特例，比如时间。<br/>";
    sql += "--2. 字段默认值约束要加约束名,格式为DF_表名_字段名.<br/>";
    sql += "--3. 表的描述和字段描述都要写清楚.<br/>";
    sql += "--4. 添加的字段最好设置为Not NULL,不然又要写个SQL语句去更新NULL的值。<br/>";
    sql += "ALTER TABLE 表名  ADD 列名 字段类型 NOT NULL CONSTRAINT [DF_表名_列名] default(默认值) ;<br/>";

    var sql2 = "<br/>EXEC sys.sp_addextendedproperty &#64;name=N'MS_Description', &#64;value=N'字段描述' ,&#64;level0type=N'SCHEMA',&#64;level0name=N'dbo', &#64;level1type=N'TABLE',&#64;level1name=N'表名',&#64;level2type=N'COLUMN',&#64;level2name=N'字段名'";
    var foot = " </code></pre>";
    $("#spCreateSql").html(head + sql + sql2 + foot);
}


function Build2() {
    $("#spWinTitle").text("SQL脚本预览窗口");
    var tblName = $("#inpAlterTableName").val();
    var sqlBody = "";

    var excute = "";

    var sqlFoot = "";
    var defaultvalue = "";
    $("#tb1").find("tr").each(function () {
        var tds = $(this).children();
        var name = tds.eq(1).find("input").val();
        var type = tds.eq(2).find("input").val();
        var desc = tds.eq(3).find("input").val();
        if (name != undefined) {
            if (type.toLowerCase() == "datetime") {
                defaultvalue = "getdate()";
            } else if (keyFilter.indexOf(type.toLowerCase()) == -1) {
                defaultvalue = "''";
            } else {
                defaultvalue = "0";
            }
            sqlBody += "Alter Table " + tblName + " Add " + name + " " + type + "  NOT NULL CONSTRAINT [DF_" + tblName + "_" + name + "] default(" + defaultvalue + ");<br/>";

            excute += "EXEC sys.sp_addextendedproperty &#64;name=N'MS_Description',&#64;value=N'" + desc + "' , &#64;level0type=N'SCHEMA',&#64;level0name=N'dbo', &#64;level1type=N'TABLE',&#64;level1name=N'" + tblName + "', &#64;level2type=N'COLUMN',&#64;level2name=N'" + name + "'<br/>";
        }
    });


    $("#spCreateSql").html(sqlBody + excute + "<br/>");
}