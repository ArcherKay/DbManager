using DbManager.Common;
using DbManager.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DbManager.Controllers
{
    public class CsToolController : Controller
    {
        static string ConnString = $"Data Source={ConfigHelper.GetValue("DbServerAddress")};Initial Catalog={ConfigHelper.GetValue("DbName")};User ID={ConfigHelper.GetValue("DbLoginUser")};Password={ConfigHelper.GetValue("DbLoginPwd")}";
        // GET: CsTool
        public ActionResult Index()
        {
            ViewData["message"] = "";
            if (ConfigHelper.GetValue("DbName") == "")
                ViewData["message"] = "请先配置数据库链接！";
            try
            {
                SqlConnection con = new SqlConnection(ConnString);
                con.Open();
            }
            catch (Exception ex)
            {
                ViewData["message"] = ex.Message;
            }

            return View();
        }

        /// <summary>
        /// 命名空间配置
        /// </summary>
        /// <returns></returns>
        public ActionResult NameSpaceConfig()
        {
            ViewData["ModelNameSpace"] = ConfigHelper.GetValue("ModelNameSpace");
            ViewData["BLLNameSpace"] = ConfigHelper.GetValue("BLLNameSpace");
            ViewData["DALNameSpace"] = ConfigHelper.GetValue("DALNameSpace");
            return View();
        }

        /// <summary>
        /// 保存命名空间配置
        /// </summary>
        /// <param name="modelName"></param>
        /// <param name="dalName"></param>
        /// <param name="bllName"></param>
        /// <returns></returns>
        public JsonResult SaveConfig(string modelName, string dalName, string bllName)
        {
            var result = false;
            var message = "保存失败";
            try
            {
                ConfigHelper.SetValue("ModelNameSpace", modelName);
                ConfigHelper.SetValue("BLLNameSpace", dalName);
                ConfigHelper.SetValue("DALNameSpace", bllName);
                result = true;
                message = "保存成功";
            }
            catch (Exception ex)
            {
                message = ex.Message;
            }
            return Json(new { result = result, message = message }, JsonRequestBehavior.AllowGet);
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



        #region 代码生产工具

        //命名空间
        string ModelNameSpace = ConfigHelper.GetValue("ModelNameSpace");
        string BLLNameSpace = ConfigHelper.GetValue("BLLNameSpace");
        string DALNameSpace = ConfigHelper.GetValue("DALNameSpace");

        /// <summary>
        /// 生成单个数据实体文件
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        public ActionResult buildModel(string tableName, string type)
        {
            var result = true;
            var message = "生成成功,请打开D盘DbCenter查看生成文件";
            var tableInfo = TableHelper.GetAllTables().Where(m => m.TableName == tableName).FirstOrDefault();
            try
            {
                WriteSw(tableName, tableInfo.TableDesc, type);
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
        public ActionResult buildBatchModels(string tables, string type)
        {
            var tableList = tables.Split(',');
            var result = true;
            var message = "生成成功,请打开D盘DbCenter查看生成文件";
            string ModelNameSpace = ConfigHelper.GetValue("ModelNameSpace");
            try
            {
                foreach (var tableName in tableList)
                {
                    var tableInfo = TableHelper.GetAllTables().Where(m => m.TableName == tableName).FirstOrDefault();
                    WriteSw(tableName, tableInfo.TableDesc, type);
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
        public ActionResult buildAllModels(string type)
        {
            var result = true;
            var message = "生成成功,请打开D盘DbCenter查看生成文件";
            var tableList = TableHelper.GetAllTables();
            try
            {
                foreach (var t in tableList)
                {
                    WriteSw(t.TableName, t.TableDesc, type);
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
        /// <param name="type">类型 1-EF，2-Dapper</param>
        private void WriteSw(string tableName, string tableDesc, string type)
        {
            //设置文件路径
            string filetype = type == "1" ? "EF" : "Dapper";
            string filepath = $"d:\\DbCenter\\Model\\{filetype}\\";
            var structs = TableHelper.GetTableStruct(tableName);
            if (!Directory.Exists(filepath)) { Directory.CreateDirectory(filepath); }//路径不存在时，创建路径  
            if (System.IO.File.Exists($"d:\\DbCenter\\Model\\{filetype}\\{tableName}.cs")) { System.IO.File.Delete($"d:\\DbCenter\\Model\\{filetype}\\{tableName}.cs"); }
            FileStream fs = new FileStream($"d:\\DbCenter\\Model\\{filetype}\\{tableName}.cs", FileMode.OpenOrCreate);
            StreamWriter sw = new StreamWriter(fs);
            if (type == "1")
            {
                sw.WriteLine("//------------------------------------------------------------------------------ \t");
                sw.WriteLine("//    描述：EF模型实体类 \t");
                sw.WriteLine("//    作者：杨隆健 \t");
                sw.WriteLine("//------------------------------------------------------------------------------ \t");
                sw.WriteLine("using System; \t");
                sw.WriteLine($"namespace {ModelNameSpace} \t");
                sw.WriteLine("{ \t");
                sw.WriteLine("    /// <summary> \t");
                sw.WriteLine($"    /// {tableDesc}实体类 \t");
                sw.WriteLine("   /// </summary>\t");
                sw.WriteLine($"   public partial class {tableName} \t");
                sw.WriteLine("   { \t");
                string isNull = "";//可否为空
                string fieldtype = "string";
                var typeList = FieldTypeDic();
                foreach (var item in structs)
                {
                    sw.WriteLine("      /// <summary> \t");
                    sw.WriteLine($"      /// {item.FieldDesc} \t");
                    sw.WriteLine("      /// </summary>\t");
                    //验证是否可空
                    fieldtype = typeList[item.FieldType];
                    isNull = fieldtype == "string" ? "" : (item.IsNull == "False" ? "" : "?");
                    sw.WriteLine("      public " + fieldtype + isNull + " " + item.FieldName + "  { get; set; } \t");
                }
                sw.WriteLine("   }\t");
                sw.WriteLine("}\t");
            }
            else
            {
                sw.WriteLine("//------------------------------------------------------------------------------ \t");
                sw.WriteLine("//    描述：Dapper模型实体类 \t");
                sw.WriteLine("//    作者：杨隆健 \t");
                sw.WriteLine("//------------------------------------------------------------------------------ \t");
                sw.WriteLine("using System; \t");
                sw.WriteLine("using DapperExtensions.Mapper; \t");
                sw.WriteLine($"namespace {ModelNameSpace} \t");
                sw.WriteLine("{ \t");
                sw.WriteLine("    /// <summary> \t");
                sw.WriteLine($"    /// {tableDesc}实体类 \t");
                sw.WriteLine("   /// </summary>\t");
                sw.WriteLine("    [Serializable]\t");
                sw.WriteLine($"   public class {tableName} \t");
                sw.WriteLine("   { \t");
                string isNull = "";//可否为空
                string fieldtype = "string";
                var typeList = FieldTypeDic();
                foreach (var item in structs)
                {
                    sw.WriteLine("      /// <summary> \t");
                    sw.WriteLine($"      /// {item.FieldDesc} \t");
                    sw.WriteLine("      /// </summary>\t");
                    //验证是否可空
                    fieldtype = typeList[item.FieldType];
                    isNull = fieldtype == "string" ? "" : (item.IsNull == "False" ? "" : "?");
                    sw.WriteLine("      public " + fieldtype + isNull + " " + item.FieldName + "  { get; set; } \t");
                }
                sw.WriteLine("   }\t");

                //写入map
                sw.WriteLine("    /// <summary> \t");
                sw.WriteLine($"    /// {tableDesc}映射类 \t");
                sw.WriteLine("   /// </summary>\t");
                sw.WriteLine("    [Serializable]\t");
                sw.WriteLine($"   public class {tableName}Map:ClassMapper<{tableName}> \t");
                sw.WriteLine("    { \t");

                sw.WriteLine($"          public {tableName}Map()\t");
                sw.WriteLine("           {\t");
                sw.WriteLine("                  base.Table(\"" + tableName + "\");\t");
                sw.WriteLine("                   AutoMap();\t");
                sw.WriteLine("           }\t");
                sw.WriteLine("    }\t");
                sw.WriteLine("}\t");
            }
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




        /// <summary>
        /// 生成三层
        /// </summary>
        /// <returns></returns>
        public ActionResult buildService()
        {
            var result = true;
            var message = "生成成功,请打开D盘DbCenter查看生成文件";
            var tableList = TableHelper.GetAllTables();
            try
            {
                //设置文件路径
                string filepath = $"d:\\DbCenter\\Service\\";
                if (!Directory.Exists(filepath)) { Directory.CreateDirectory(filepath); }//路径不存在时，创建路径    

                WriteIDal(tableList);
                WriteDal(tableList);
                WriteIBll(tableList);
                WriteBll(tableList);
            }
            catch (Exception ex)
            {
                message = ex.Message;
            }
            return Json(new { result = result, message = message }, JsonRequestBehavior.AllowGet);
        }


        /// <summary>
        /// 写入数据层接口
        /// </summary>
        /// <param name="tableList"></param>
        private void WriteIDal(List<DatabaseTable> tableList)
        {
            if (System.IO.File.Exists(@"d:\DbCenter\Service\IDals.cs")) { System.IO.File.Delete(@"d:\DbCenter\Service\IDals.cs"); }
            FileStream fs = new FileStream("d:\\DbCenter\\Service\\IDals.cs", FileMode.OpenOrCreate);
            StreamWriter sw = new StreamWriter(fs);
            sw.WriteLine("//------------------------------------------------------------------------------ \t");
            sw.WriteLine("//    描述：数据层接口 \t");
            sw.WriteLine("//    作者：杨隆健 \t");
            sw.WriteLine("//------------------------------------------------------------------------------ \t");
            sw.WriteLine($"using {ModelNameSpace}; \t");
            sw.WriteLine($"namespace {DALNameSpace} \t");
            sw.WriteLine("{ \t");
            foreach (var item in tableList)
            {
                sw.WriteLine("     public partial interface I" + item.TableName + "Dal : IBaseDal<" + item.TableName + "> { }\t");
            }
            sw.WriteLine("}\t");
            sw.Flush();
            sw.Close();
        }

        /// <summary>
        /// 写入数据层实现类
        /// </summary>
        /// <param name="tableList"></param>
        private void WriteDal(List<DatabaseTable> tableList)
        {
            if (System.IO.File.Exists(@"d:\DbCenter\Service\Dals.cs")) { System.IO.File.Delete(@"d:\DbCenter\Service\Dals.cs"); }
            FileStream fs = new FileStream("d:\\DbCenter\\Service\\Dals.cs", FileMode.OpenOrCreate);
            StreamWriter sw = new StreamWriter(fs);
            sw.WriteLine("//------------------------------------------------------------------------------ \t");
            sw.WriteLine("//    描述：数据层实现类 \t");
            sw.WriteLine("//    作者：杨隆健 \t");
            sw.WriteLine("//------------------------------------------------------------------------------ \t");
            sw.WriteLine($"using {ModelNameSpace}; \t");
            sw.WriteLine($"namespace {DALNameSpace} \t");
            sw.WriteLine("{ \t");
            foreach (var item in tableList)
            {
                sw.WriteLine("     public partial class " + item.TableName + "Dal : BaseDal<" + item.TableName + ">,I" + item.TableName + "Dal { }\t");
            }
            sw.WriteLine("}\t");
            sw.Flush();
            sw.Close();
        }

        /// <summary>
        /// 写入业务层接口
        /// </summary>
        /// <param name="tableList"></param>
        private void WriteIBll(List<DatabaseTable> tableList)
        {
            if (System.IO.File.Exists(@"d:\DbCenter\Service\IServices.cs")) { System.IO.File.Delete(@"d:\DbCenter\Service\IServices.cs"); }
            FileStream fs = new FileStream("d:\\DbCenter\\Service\\IServices.cs", FileMode.OpenOrCreate);
            StreamWriter sw = new StreamWriter(fs);
            sw.WriteLine("//------------------------------------------------------------------------------ \t");
            sw.WriteLine("//    描述：业务层接口 \t");
            sw.WriteLine("//    作者：杨隆健 \t");
            sw.WriteLine("//------------------------------------------------------------------------------ \t");
            sw.WriteLine($"using {ModelNameSpace}; \t");
            sw.WriteLine($"namespace {BLLNameSpace} \t");
            sw.WriteLine("{ \t");
            foreach (var item in tableList)
            {
                sw.WriteLine("     public partial interface I" + item.TableName + "Service : IBaseService<" + item.TableName + "> { }\t");
            }
            sw.WriteLine("}\t");
            sw.Flush();
            sw.Close();
        }

        /// <summary>
        /// 写入业务层实现类
        /// </summary>
        /// <param name="tableList"></param>
        private void WriteBll(List<DatabaseTable> tableList)
        {
            if (System.IO.File.Exists(@"d:\DbCenter\Service\Services.cs")) { System.IO.File.Delete(@"d:\DbCenter\Service\Services.cs"); }
            FileStream fs = new FileStream("d:\\DbCenter\\Service\\Services.cs", FileMode.OpenOrCreate);
            StreamWriter sw = new StreamWriter(fs);
            sw.WriteLine("//------------------------------------------------------------------------------ \t");
            sw.WriteLine("//    描述：业务层实现类 \t");
            sw.WriteLine("//    作者：杨隆健 \t");
            sw.WriteLine("//------------------------------------------------------------------------------ \t");
            sw.WriteLine($"using {ModelNameSpace}; \t");
            sw.WriteLine($"namespace {BLLNameSpace} \t");
            sw.WriteLine("{ \t");
            foreach (var item in tableList)
            {
                sw.WriteLine("     public partial interface " + item.TableName + "Service : BaseService<" + item.TableName + ">,I" + item.TableName + "Service");
                sw.WriteLine("     { \t");
                sw.WriteLine("         public override void SetCurrentDal() { CurrentDal = DbSession." + item.TableName + "Dal; }\t");
                sw.WriteLine("      } \t");
            }
            sw.WriteLine("}\t");
            sw.Flush();
            sw.Close();
        }
        #endregion
    }
}