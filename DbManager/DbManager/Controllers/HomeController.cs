using System;
using System.Data;
using System.Data.SqlClient;
using System.Web.Mvc;
namespace DbManager.Controllers
{
    public class HomeController : Controller
    {
       
        public ActionResult Index()
        {
            return View();
        }


        #region 数据库连接配置

        /// <summary>
        /// 获取当前配置数据库
        /// </summary>
        /// <returns></returns>
        public ActionResult GetCurrenDb()
        {
            return Json(new { DbServerAddress= ConfigHelper.GetValue("DbServerAddress"), DbName= ConfigHelper.GetValue("DbName"),
                DbLoginUser = ConfigHelper.GetValue("DbLoginUser"), DbLoginPwd = ConfigHelper.GetValue("DbLoginPwd") }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// 测试连接
        /// </summary>
        /// <param name="DbServerAddress"></param>
        /// <param name="DbName"></param>
        /// <param name="DbLoginUser"></param>
        /// <param name="DbLoginPwd"></param>
        /// <returns></returns>
        public ActionResult ConnectedTest(string DbServerAddress,string DbName,string DbLoginUser,string DbLoginPwd)
        {
            var connectStr = $"Data Source={DbServerAddress};Initial Catalog={DbName};User ID={DbLoginUser};Password={DbLoginPwd}";
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
        /// <param name="DbServerAddress"></param>
        /// <param name="DbName"></param>
        /// <param name="DbLoginUser"></param>
        /// <param name="DbLoginPwd"></param>
        /// <returns></returns>
        public ActionResult SaveCurrentDBSet(string DbServerAddress, string DbName, string DbLoginUser, string DbLoginPwd)
        {
            var result = false;
            var message = "保存失败";
            try
            {
                ConfigHelper.SetValue("DbServerAddress", DbServerAddress);
                ConfigHelper.SetValue("DbName",DbName);
                ConfigHelper.SetValue("DbLoginUser",DbLoginUser);
                ConfigHelper.SetValue("DbLoginPwd", DbLoginPwd);
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