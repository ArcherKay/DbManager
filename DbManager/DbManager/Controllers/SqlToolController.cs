using DbManager.Models;
using System.Collections.Generic;
using System.Text;
using System.Web.Mvc;
namespace DbManager.Controllers
{
    public class SqlToolController : Controller
    {
        // GET: SqlTool
        public ActionResult Index()
        {
            return View();
        }

        string keyFilter = "int|decimal|tinyint|money|long|bigint|byte|short|char|decimal(19,5)|decimal(18,2)";
        /// <summary>
        /// 创建sql脚本
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="tableDesc"></param>
        /// <param name="tableIndex"></param>
        /// <param name="tableList"></param>
        /// <returns></returns>
        public ActionResult CreateSql(string tableName, string tableDesc, string tableIndex, List<TableDetail> tableList)
        {
            StringBuilder sb = new StringBuilder();

            sb.Append("<pre><code class=\"language-sql\">");
            sb.Append($"IF NOT EXISTS (select * from sysobjects where id = object_id(N'[{tableName}]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)  <br/>");
            sb.Append("Begin<br/>");
            sb.Append($" Create table {tableName} <br/> ( <br/>");
            //默认添加主键Id
            sb.Append("&nbsp;&nbsp;&nbsp;Id int Identity(1,1) NOT NULL,<br/>");

            var defaultvalue = "";
            //字段
            foreach (var item in tableList)
            {
                if (item.FieldType.ToLower() == "datetime")
                {
                    defaultvalue = "getdate()";
                }
                else if (keyFilter.Contains(item.FieldType.ToLower()))
                {
                    defaultvalue = "0";
                }
                else
                {
                    defaultvalue = "''";
                }
                sb.Append($"&nbsp;&nbsp;&nbsp;{item.FieldName} {item.FieldType} Constraint DF_{tableName}_{item.FieldName} default({defaultvalue}) NOT NULL,<br/>");
            }
            //默认添加AddTime,ModifyTime字段
            sb.Append($"&nbsp;&nbsp;&nbsp;AddTime DateTime Constraint DF_{tableName}_AddTime default(getdate()) NOT NULL,<br/>");
            sb.Append($"&nbsp;&nbsp;&nbsp;ModifyTime DateTime Constraint DF_{tableName}_ModifyTime default(getdate()) NOT NULL,<br/>");

            //添加主键
            sb.Append($"CONSTRAINT [PK_{tableName}] PRIMARY KEY CLUSTERED <br/>");
            sb.Append("(<br/>&nbsp;&nbsp;&nbsp;[Id] ASC<br/>");
            sb.Append(")WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY] <br/>");
            sb.Append(") ON[PRIMARY]");
            //描述
            sb.Append($"EXECUTE sp_addextendedproperty N'MS_Description', '{tableDesc}', N'user', N'dbo', N'table', N'{tableName}', NULL, NULL <br/>");
            sb.Append($"EXECUTE sp_addextendedproperty N'MS_Description', '主键ID', N'user', N'dbo', N'table', N'{tableName}', N'column', N'Id' <br/>");

            foreach (var item in tableList)
            {
                sb.Append($"EXECUTE sp_addextendedproperty N'MS_Description', '{item.FieldDesc}', N'user', N'dbo', N'table', N'{tableName}', N'column', N'{item.FieldName}' <br/>");
            }
            sb.Append($"EXECUTE sp_addextendedproperty N'MS_Description', '添加时间', N'user', N'dbo', N'table', N'{tableName}', N'column', N'AddTime' <br/>");
            sb.Append($"EXECUTE sp_addextendedproperty N'MS_Description', '修改时间', N'user', N'dbo', N'table', N'{tableName}', N'column', N'ModifyTime' <br/>");
            //添加索引
            if (!string.IsNullOrEmpty(tableIndex))
            {
                sb.Append($"Create Index Ix_{tableName}_{tableIndex}  On {tableName} ({tableIndex});<br/>");
            }
            sb.Append("END ");
            sb.Append(" </code></pre>");
            return Json(sb.ToString(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult SqlTemplate()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("<pre><code class=\"language-sql\" style=\"color:green\">");
            sb.Append("--创建表示例<br/>");
            sb.Append("--1.  必须有主键Id字段.<br/>");
            sb.Append("--2. 原则上字段要加默认值,default(''),数值为default(0),所有字段的值不允许为NULL.除非某些特例，比如时间。<br/>");
            sb.Append("--3. 字段默认值约束要加约束名,格式为DF_表名_字段名.<br/>");
            sb.Append("--4. 表的描述和字段描述都要写清楚.<br/>");
            sb.Append("--5. 适当创建索引,格式为Ix_表名_字段名.比如,外键一定要加索引.<br/>");
            sb.Append("--6.  AddTime,ModifyTime字段一定要有,最后修改时间字段看具体情况可选择性添加.<br/>");
            sb.Append(" </code>");
            sb.Append("<code class=\"language-sql\">");
            sb.Append("IF NOT EXISTS (select * from sysobjects where id = object_id(N'[ReportTask]') and OBJECTPROPERTY(id, N'IsUserTable') = 1)  <br/>");
            sb.Append("Begin <br/>");
            sb.Append("Create table ReportTask<br/>");
            sb.Append("(<br/>");
            sb.Append("Id int Identity(1,1) NOT NULL,<br/>");
            sb.Append("FxsNo varchar(20) Constraint DF_ReportTask_FxsNo default(''),<br/>");
            sb.Append("EShopId tinyint Constraint DF_ReportTask_EShopId default(0),<br/>");
            sb.Append("Status int Constraint DF_ReportTask_Status default(0),<br/>");
            sb.Append("AddTime DateTime Constraint DF_ReportTask_AddTime default(getdate()),<br/>");
            sb.Append("ModifyTime DateTime Constraint DF_ReportTask_ModifyTime default(getdate()),<br/>");
            sb.Append(" CONSTRAINT [PK_ReportTask] PRIMARY KEY CLUSTERED<br/>");
            sb.Append("(<br/>");
            sb.Append("&nbsp;&nbsp;&nbsp;[Id] ASC<br/>");
            sb.Append(")WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]<br/>");
            sb.Append("<br/>) ON [PRIMARY]");
            sb.Append("<br/>EXECUTE sp_addextendedproperty N'MS_Description', '报告任务表', N'user', N'dbo', N'table', N'ReportTask', NULL, NULL  --表名<br/> ");
            sb.Append("EXECUTE sp_addextendedproperty N'MS_Description', '主键ID', N'user', N'dbo', N'table', N'ReportTask', N'column', N'Id'<br/> ");
            sb.Append("EXECUTE sp_addextendedproperty N'MS_Description', '编号', N'user', N'dbo', N'table', N'ReportTask', N'column', N'FxsNo' <br/>");
            sb.Append("EXECUTE sp_addextendedproperty N'MS_Description', '店铺ID', N'user', N'dbo', N'table', N'ReportTask', N'column', N'EShopId'<br/> ");
            sb.Append("EXECUTE sp_addextendedproperty N'MS_Description', '请求状态 默认：0：已提交 1：已完成 2：已失败', N'user', N'dbo', N'table', N'ReportTask', N'column', N'Status'<br/> ");
            sb.Append("EXECUTE sp_addextendedproperty N'MS_Description', '添加时间', N'user', N'dbo', N'table', N'ReportTask', N'column', N'AddTime'<br/>");
            sb.Append("EXECUTE sp_addextendedproperty N'MS_Description', '修改时间', N'user', N'dbo', N'table', N'ReportTask', N'column', N'ModifyTime'");
            sb.Append("<br/>--创建索引<br/>Create Index Ix_ReportTask_EShopId  On ReportTask(EShopId);<br/>");
            sb.Append("END ");
            sb.Append(" </code></pre>");
            return Json(sb.ToString(), JsonRequestBehavior.AllowGet);
        }

        public ActionResult FieldSqlTemplate()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("<pre><code class=\"language-sql\" style=\"color:green\">");
            sb.Append("--增加字段示例<br/>");
            sb.Append("--1. 原则上字段要加默认值,字符串为default(''),数值为default(0),所有字段的值不允许为NULL.除非某些特例，比如时间。<br/>");
            sb.Append("--2. 字段默认值约束要加约束名,格式为DF_表名_字段名.<br/>");
            sb.Append("--3. 表的描述和字段描述都要写清楚.<br/>");
            sb.Append("--4. 添加的字段最好设置为Not NULL,不然又要写个SQL语句去更新NULL的值。<br/>");
            sb.Append(" </code>");
            sb.Append("<code class=\"language-sql\">");
            sb.Append("ALTER TABLE 表名  ADD 列名 字段类型 NOT NULL CONSTRAINT [DF_表名_列名] default(默认值) ;<br/>");
            sb.Append("<br/>EXEC sys.sp_addextendedproperty &#64;name=N'MS_Description', &#64;value=N'字段描述' ,&#64;level0type=N'SCHEMA',&#64;level0name=N'dbo', &#64;level1type=N'TABLE',&#64;level1name=N'表名',&#64;level2type=N'COLUMN',&#64;level2name=N'字段名'");
            sb.Append(" </code></pre>");
            return Json(sb.ToString(), JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// 创建字段
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="tableList"></param>
        /// <returns></returns>
        public ActionResult CreateFieldSql(string tableName, List<TableDetail> tableList)
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("<pre><code class=\"language-sql\">");
            var defaultvalue = "";
            foreach (var item in tableList)
            {
                if (item.FieldType.ToLower() == "datetime")
                {
                    defaultvalue = "getdate()";
                }
                else if (keyFilter.Contains(item.FieldType.ToLower()))
                {
                    defaultvalue = "0";
                }
                else
                {
                    defaultvalue = "''";
                }
                sb.Append($"Alter Table {tableName} Add {item.FieldName} {item.FieldType}  NOT NULL CONSTRAINT [DF_{tableName}_{item.FieldName}] default({defaultvalue});<br/>");
                sb.Append($"EXEC sys.sp_addextendedproperty &#64;name=N'MS_Description',&#64;value=N'{item.FieldDesc}' , &#64;level0type=N'SCHEMA',&#64;level0name=N'dbo', &#64;level1type=N'TABLE',&#64;level1name=N'{tableName}', &#64;level2type=N'COLUMN',&#64;level2name=N'{item.FieldName}'<br/>");
            }
            sb.Append(" </code></pre>");
            return Json(sb.ToString(), JsonRequestBehavior.AllowGet);
        }
    }
}