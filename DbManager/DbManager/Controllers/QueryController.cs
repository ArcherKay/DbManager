using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DbManager.Common;
namespace DbManager.Controllers
{
    public class QueryController : Controller
    {
        // GET: Query
        public ActionResult Index()
        {
            if (Config.GetValue("DbName") == "")
                return Content("请先配置数据库链接！");
            return View();
        }
        /// <summary>
        /// 获取表
        /// </summary>
        /// <returns></returns>
        public JsonResult GetAllTables(int pageSize,int pageNumber,string tableName)
        {
            IList<SysDatabaseTable> _tableList = DataConversion.Convert<SysDatabaseTable>.ToList(MsSql.GetAllTables());
            if (!string.IsNullOrWhiteSpace(tableName))
            {
                _tableList = _tableList.Where(m => m.TableName == tableName).ToList();
            }

            var data = _tableList.OrderBy(m => m.TableName).Skip(pageSize * (pageNumber - 1)).Take(pageSize);
            var sysDatabaseTables = data as SysDatabaseTable[] ?? data.ToArray();
            var total = _tableList.Count();
            return Json(WebUtils.BoostrapTableDataBind(sysDatabaseTables, total), JsonRequestBehavior.AllowGet);

        }

        /// <summary>
        /// 根据表名获取表结构
        /// </summary>
        /// <returns></returns>
        public JsonResult GetTableStruct(int pageSize, int pageNumber, string tableName)
        {
            DataTable dt = MsSql.GetTableStruct(tableName);
            IList<TableStruct> structs = DataConversion.Convert<TableStruct>.ToList(dt);
            int total = dt.Rows.Count;
            var structData = structs.OrderBy(m => m.FieldName).Skip(pageSize * (pageNumber - 1)).Take(pageSize);
            return Json(WebUtils.BoostrapTableDataBind(structData, total), JsonRequestBehavior.AllowGet);
        }

        
    }
}