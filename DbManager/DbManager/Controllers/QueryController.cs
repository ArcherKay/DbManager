using DbManager.Common;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.Mvc;
namespace DbManager.Controllers
{
    public class QueryController : Controller
    {
        // GET: Query
        public ActionResult Index()
        {
            if (ConfigHelper.GetValue("DbName") == "")
                return Content("请先配置数据库链接！");
            return View();
        }

        public ActionResult Detail(string tableName)
        {
            if (ConfigHelper.GetValue("DbName") == "")
                return Content("请先配置数据库链接！");
            ViewData["tableName"] = tableName;
            return View();
        }
        /// <summary>
        /// 获取表
        /// </summary>
        /// <returns></returns>
        public JsonResult GetAllTables(int pageSize, int pageNumber, string tableName)
        {
            var _tableList = TableHelper.GetAllTables();
            if (!string.IsNullOrWhiteSpace(tableName))
            {
                _tableList = _tableList.Where(m => m.TableName.Contains(tableName)).ToList();
            }
            var data = _tableList.OrderBy(m => m.TableName).Skip(pageSize * (pageNumber - 1)).Take(pageSize);
            var total = _tableList.Count();
            return Json(new { D = data, T = total }, JsonRequestBehavior.AllowGet);

        }

        /// <summary>
        /// 根据表名获取表结构
        /// </summary>
        /// <returns></returns>
        public JsonResult GetTableStruct(int pageSize, int pageNumber, string tableName)
        {
            var structs = TableHelper.GetTableStruct(tableName);
            int total = structs.Count;
            var structData = structs.OrderBy(m => m.FieldName).Skip(pageSize * (pageNumber - 1)).Take(pageSize);
            return Json(new { D = structData, T = total }, JsonRequestBehavior.AllowGet);
        }


        #region 代码生产工具

        //命名空间
        string ModelNameSpace = ConfigHelper.GetValue("ModelNameSpace");

        /// <summary>
        /// 生成单个数据实体文件
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        public ActionResult buildModel(string tableName)
        {
            var result = true;
            var message = "生成成功";
            
            try
            {
                WriteSw(tableName);
            }
            catch (Exception ex)
            {
                message = ex.Message;
            }

            return Json(new { result = result, message = message }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// 生产多个实体
        /// </summary>
        /// <param name="tables"></param>
        /// <returns></returns>
        public ActionResult buildBatchModels(string tables)
        {
            var tableList = tables.Split(',');
            var result = true;
            var message = "生成成功";
            string ModelNameSpace = ConfigHelper.GetValue("ModelNameSpace");
            try
            {
                foreach (var tableName in tableList)
                {
                    WriteSw(tableName);
                }
            }
            catch (Exception ex)
            {
                message = ex.Message;
            }
            return Json(new { result = result, message = message }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// 生成全部
        /// </summary>
        /// <returns></returns>
        public ActionResult buildAllModels()
        {
            var result = true;
            var message = "生成成功";
            var tableList = TableHelper.GetAllTables();
            try
            {
                foreach (var t in tableList)
                {
                    WriteSw(t.TableName);
                }
            }
            catch (Exception ex)
            {
                message = ex.Message;
            }
            return Json(new { result = result, message = message }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// 写入文件
        /// </summary>
        /// <param name="tableName">表名</param>
        private void WriteSw(string tableName)
        {
            string filepath = "d:\\Model\\";
            var structs = TableHelper.GetTableStruct(tableName);
            if (!Directory.Exists(filepath)) { Directory.CreateDirectory(filepath); }//路径不存在时，创建路径    
            FileStream fs = new FileStream($"d:\\Model\\{tableName}.cs", FileMode.OpenOrCreate);
            StreamWriter sw = new StreamWriter(fs);
            sw.WriteLine("//------------------------------------------------------------------------------ \t");
            sw.WriteLine("//    描述：EF模型类 \t");
            sw.WriteLine("//    作者：杨隆健 \t");
            sw.WriteLine("//------------------------------------------------------------------------------ \t");
            sw.WriteLine("using System; \t");
            sw.WriteLine($"namespace {ModelNameSpace} \t");
            sw.WriteLine("{ \t");
            sw.WriteLine($"   public partial class {tableName} \t");
            sw.WriteLine("   { \t");
            string isNull = "";//可否为空
            string type = "string";
            var typeList = FieldTypeDic();
            foreach (var item in structs)
            {
                sw.WriteLine("      /// <summary> \t");
                sw.WriteLine($"      /// {item.FieldDesc} \t");
                sw.WriteLine("      /// </summary>\t");
                //验证是否可空
                type = typeList[item.FieldType];
                isNull = type == "string" ? "" : (item.IsNull == "False" ? "" : "?");
                sw.WriteLine("      public " + type + isNull + " " + item.FieldName + "  { get; set; } \t");
            }
            sw.WriteLine("   }\t");
            sw.WriteLine("}\t");
            sw.Flush();
            sw.Close();
        }
        /// <summary>
        /// 字段类型字典
        /// </summary>
        /// <returns></returns>
        public IDictionary<string, string> FieldTypeDic()
        {
            Dictionary<string, string> d = new Dictionary<string, string>();
            d.Add("smallint", "Int16");
            d.Add("int", "Int32");
            d.Add("real", "Single");
            d.Add("float", "Double");
            d.Add("money", "Decimal");
            d.Add("smallmoney", "Decimal");
            d.Add("bit", "Boolean");
            d.Add("tinyint", "Object");
            d.Add("bigint", "Int64");
            d.Add("timestamp", "Binary");
            d.Add("binary", "Binary");
            d.Add("image", "Binary");
            d.Add("text", "string");
            d.Add("ntext", "string");
            d.Add("decimal", "Decimal");
            d.Add("numeric", "Decimal");
            d.Add("datetime", "DateTime");
            d.Add("smalldatetime", "DateTime");
            d.Add("sql_variant", "Object");
            d.Add("xml", "string");
            d.Add("varchar", "string");
            d.Add("char", "string");
            d.Add("nchar", "string");
            d.Add("nvarchar", "string");
            d.Add("varbinary", "Binary");
            d.Add("uniqueidentifier", "Guid");
            d.Add("date", "DateTime");
            d.Add("time", "Object");
            d.Add("datetime2", "DateTime");
            d.Add("datetimeoffset", "Object");
            return d;
        }
        #endregion
    }
}