using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DbManager.Models
{
    /// <summary>
    /// 新增表详细
    /// </summary>
    public class TableDetail
    {
        /// <summary>
        /// 字段名
        /// </summary>
        public string FieldName { get; set; }
        /// <summary>
        /// 字段类型
        /// </summary>
        public string FieldType { get; set; }
        /// <summary>
        /// 字段描述
        /// </summary>
        public string FieldDesc { get; set; }
    }
}