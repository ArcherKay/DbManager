using DbManager.Common;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web.Mvc;
namespace DbManager.Controllers
{
    public class QueryController : Controller
    {
        static string ConnString = $"Data Source={ConfigHelper.GetValue("DbServerAddress")};Initial Catalog={ConfigHelper.GetValue("DbName")};User ID={ConfigHelper.GetValue("DbLoginUser")};Password={ConfigHelper.GetValue("DbLoginPwd")}";
        // GET: Query
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

        public ActionResult Detail(string tableName)
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
    }
}