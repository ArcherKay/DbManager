using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DbManager.Common
{
    public class DbConfig
    {
        public string DbServerAddress { get; set; }
        public string DbName { get; set; }
        public string DbLoginUser { get; set; }
        public string DbLoginPwd { get; set; }
    }
}