using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DbManager.Common
{
    public class WebUtils
    {
        public static BootstrapTable BoostrapTableDataBind<T>(T t, int total)
        {
            return new BootstrapTable
            {
                D = t,
                T = total
            };
        }

        public class BootstrapTable
        {
            public object D { get; set; }
            public int T { get; set; }
        }
    }
}