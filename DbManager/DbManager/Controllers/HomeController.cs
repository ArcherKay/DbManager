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
            var result = false;
            var message = "连接失败";
            SqlConnection conn = new SqlConnection(connectStr);
            try
            {
                conn.Open();
                if (conn.State == ConnectionState.Open) {
                    result = true;
                    message = "连接成功";
                }
            }
            catch (Exception ex)
            {
                message = ex.Message;
            }

            return Json(new { result= result,message= message }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// 保存配置
        /// </summary>
        /// <param name="dbConfig"></param>
        /// <returns></returns>
        public ActionResult SaveCurrentDBSet(DbConfig dbConfig)
        {
            var result = false;
            var message = "保存失败";
            try
            {
                Config.SetValue("DbServerAddress", DataConversion.Get_Safe_Str(dbConfig.DbServerAddress));
                Config.SetValue("DbName", DataConversion.Get_Safe_Str(dbConfig.DbName));
                Config.SetValue("DbLoginUser", DataConversion.Get_Safe_Str(dbConfig.DbLoginUser));
                Config.SetValue("DbLoginPwd", DataConversion.Get_Safe_Str(dbConfig.DbLoginPwd));
                result = true;
                message = "保存成功";
            }
            catch (Exception ex)
            {              
                message = ex.Message;
            }

            return Json(new { result = result, message = message }, JsonRequestBehavior.AllowGet);
        }
        #endregion
    }
}