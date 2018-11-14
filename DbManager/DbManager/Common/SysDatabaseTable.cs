using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DbManager.Common
{
    /// <summary>
    /// 数据库表
    /// </summary>
    public class SysDatabaseTable
    {
        /// <summary>
        /// 表名称
        /// </summary>
        public string TableName { get; set; }

        /// <summary>
        /// 表描述
        /// </summary>
        public string TableDesc { get; set; }
    }
}