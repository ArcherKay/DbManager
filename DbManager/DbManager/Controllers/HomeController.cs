using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DbManager.Common;
using System.Data.SqlClient;
using System.Data;

namespace DbManager.Controllers
{
    public class HomeController : Controller
    {
        #region 数据库连接配置
        public ActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// 获取当前配置数据库
        /// </summary>
        /// <returns></returns>
        public ActionResult GetCurrenDb()
        {
            var dbConfig = new DbConfig()
            {
                DbServerAddress = Config.GetValue("DbServerAddress"),
                DbName = Config.GetValue("DbName"),
                DbLoginUser = Config.GetValue("DbLoginUser"),
                DbLoginPwd = Config.GetValue("DbLoginPwd")
            };
            return Json(dbConfig, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// 测试连接
        /// </summary>
        /// <param name="dbConfig"></param>
        /// <returns></returns>
        public ActionResult ConnectedTest(DbConfig dbConfig)
        {
            var connectStr = $"Data Source={DataConversion.Get_Safe_Str(dbConfig.DbServerAddress)};Initial Catalog={DataConversion.Get_Safe_Str(dbConfig.DbName)};User ID={DataConversion.Get_Safe_Str(dbConfig.DbLoginUser)};Password={DataConversion.Get_Safe_Str(dbConfig.DbLoginPwd)}";
            var result = "连接成功";
            SqlConnection conn = new SqlConnection(connectStr);
            try
            {
                conn.Open();
                if (conn.State == ConnectionState.Open) { }
            }
            catch (Exception ex)
            {
                result = ex.Message;
            }

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// 保存配置
        /// </summary>
        /// <param name="dbConfig"></param>
        /// <returns></returns>
        public ActionResult SaveCurrentDBSet(DbConfig dbConfig)
        {
            var result = "保存成功";
            try
            {
                Config.SetValue("DbServerAddress", DataConversion.Get_Safe_Str(dbConfig.DbServerAddress));
                Config.SetValue("DbName", DataConversion.Get_Safe_Str(dbConfig.DbName));
                Config.SetValue("DbLoginUser", DataConversion.Get_Safe_Str(dbConfig.DbLoginUser));
                Config.SetValue("DbLoginPwd", DataConversion.Get_Safe_Str(dbConfig.DbLoginPwd));
            }
            catch (Exception ex)
            {
                result = ex.Message;
            }

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        #endregion


        #region 查询数据表
        public ActionResult Query()
        {
            if (Config.GetValue("DbName") == "")
                return Content("请先配置数据库链接！");
            return View();
        }

        

        /// <summary>
        /// 获取当前链接表的下拉列表
        /// </summary>
        /// <returns></returns>
        public ActionResult GetAllTables()
        {
            IList<SysDatabaseTable> _tableList = DataConversion.Convert<SysDatabaseTable>.ToList(MsSql.GetAllTables());
            return Json(_tableList, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// 获取未完善的表数量
        /// </summary>
        /// <returns></returns>
        public ActionResult GetImperfectNum()
        {
            IList<SysDatabaseTable> _tableList = DataConversion.Convert<SysDatabaseTable>.ToList(MsSql.GetAllTables());
            return Content(string.Format("当前还有{0}张表未进行完善", _tableList.Count(m => m.TableDesc.Trim() == "-")));
        }

        /// <summary>
        /// 获取表结构
        /// </summary>
        /// <param name="tablename"></param>
        /// <returns></returns>
        public JsonResult GetTableStruct(string tablename)
        {
            DataTable dt = MsSql.GetTableStruct(DataConversion.Get_Safe_Str(tablename));
            IList<TableStruct> structs = DataConversion.Convert<TableStruct>.ToList(dt);
            return Json(structs, JsonRequestBehavior.AllowGet);
        }

        #endregion

        public ActionResult SqlTools()
        {
            return View();
        }

        public ActionResult CsTools()
        {
            if (Config.GetValue("DbName") == "")
                return Content("请先配置数据库链接！");
            return View();
        }
    }
}