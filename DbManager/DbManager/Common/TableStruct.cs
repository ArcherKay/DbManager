using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DbManager.Common
{
    /// <summary>
    /// 表结构
    /// </summary>
    public class TableStruct
    {
        /// <summary>
        /// 字段名称
        /// </summary>
        public string FieldName { get; set; }

        /// <summary>
        /// 字段类型
        /// </summary>
        public string FieldType { get; set; }

        /// <summary>
        /// 是否可空
        /// </summary>
        public string IsNull { get; set; }

        /// <summary>
        /// 是否主键
        /// </summary>
        public string IsPK { get; set; }

        /// <summary>
        /// 是否自增长
        /// </summary>
        public string IsSelfGrowth { get; set; }

        /// <summary>
        /// 占用字节
        /// </summary>
        public string BytesOccupied { get; set; }

        /// <summary>
        /// 字段长度
        /// </summary>
        public string FieldLength { get; set; }

        /// <summary>
        /// 小数位数
        /// </summary>
        public string FieldBit { get; set; }

        /// <summary>
        /// 字段默认值
        /// </summary>
        public string FieldDefault { get; set; }

        /// <summary>
        /// 字段描述
        /// </summary>
        public string FieldDesc { get; set; }
    }
}