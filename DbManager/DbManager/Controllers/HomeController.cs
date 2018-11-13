using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DbManager.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }


        public ActionResult Query()
        {
            return View();
        }


        public ActionResult SqlTools()
        {
            return View();
        }

        public ActionResult CsTools()
        {
            return View();
        }
    }
}