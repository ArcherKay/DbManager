using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Web;

namespace DbManager.Common
{
    public static class DataConversion
    {
        /// <summary>
        /// 安全的字符串
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static string Get_Safe_Str(object obj)
        {
            if (obj == null)
            {
                return "";
            }
            string str = obj.ToString();
            str = str.Replace("'", "‘");
            str = Regex.Replace(str, "<a ", "<a target=_blank ", RegexOptions.IgnoreCase);
            str = FilterScript(str, "body,script,iframe,object");
            return str.Trim();
        }

        #region 过滤安全字符串验证
        /// <summary>
        /// 过滤标签
        /// </summary>
        /// <param name="conStr"></param>
        /// <param name="filterItem">标签项，多个用英文逗号隔开</param>
        /// <returns></returns>
        public static string FilterScript(string conStr, string filterItem)
        {
            if (string.IsNullOrEmpty(conStr))
                return string.Empty;
            filterItem = filterItem.ToLower();
            string str = conStr.Replace("\r", "{$Chr13}").Replace("\n", "{$Chr10}");
            foreach (string str2 in filterItem.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
            {
                switch (str2)
                {
                    case "body":
                        str = CollectionFilter(str, str2, 3);
                        break;
                    case "iframe":
                        str = CollectionFilter(str, str2, 3);
                        break;

                    case "object":
                        str = CollectionFilter(str, str2, 3);
                        break;

                    case "script":
                        str = CollectionFilter(str, str2, 3);
                        break;

                    case "style":
                        str = CollectionFilter(str, str2, 3);
                        break;

                    case "div":
                        str = CollectionFilter(str, str2, 3);
                        break;

                    case "span":
                        str = CollectionFilter(str, str2, 3);
                        break;

                    case "table":
                        str = CollectionFilter(CollectionFilter(CollectionFilter(CollectionFilter(CollectionFilter(str, str2, 3), "Tbody", 3), "Tr", 3), "Td", 3), "Th", 3);
                        break;

                    case "img":
                        str = CollectionFilter(str, str2, 1);
                        break;

                    case "font":
                        str = CollectionFilter(str, str2, 3);
                        break;

                    case "a":
                        str = CollectionFilter(str, str2, 3);
                        break;

                    case "p":
                        str = CollectionFilter(str, str2, 3);
                        break;

                    case "html":
                        str = StripTags(str);
                        break;
                }
            }
            return str.Replace("{$Chr13}", "\r").Replace("{$Chr10}", "\n");
        }
        /// <summary>
        /// 过滤使用使用尖括号括起来的标签,但会保留标签中间的内容。eg. <tr>11</tr>,执行为11
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public static string StripTags(string input)
        {
            Regex regex = new Regex("<([^<]|\n)+?>");
            return regex.Replace(input, "");
        }
        /// <summary>
        /// 过滤标签,正则匹配时使用非贪婪模式
        /// </summary>
        /// <param name="conStr">待处理的文本数据</param>
        /// <param name="tagName">标签名称如,html,Script等</param>
        /// <param name="fType">过滤方式,可以取(1|2|3)
        /// 1:是单个标签如img等,
        /// 2:表示配对出现的标签如div等将清除此标签以及标签内的全部文本,
        /// 3:表示也是针对配对出现的标签,但是保留标签内的内容.
        /// </param>
        /// <returns></returns>
        public static string CollectionFilter(string conStr, string tagName, int fType)
        {
            if (string.IsNullOrEmpty(conStr))
                return string.Empty;

            string input = conStr;
            switch (fType)
            {
                case 1:
                    return Regex.Replace(input, "<" + tagName + "([^>])*>", "", RegexOptions.IgnoreCase);

                case 2:
                    return Regex.Replace(input, "<" + tagName + "([^>])*>.*?</" + tagName + "([^>])*>", "", RegexOptions.IgnoreCase);

                case 3:
                    return Regex.Replace(Regex.Replace(input, "<" + tagName + "([^>])*>", "", RegexOptions.IgnoreCase), "</" + tagName + "([^>])*>", "", RegexOptions.IgnoreCase);
            }
            return input;
        }

        #endregion


        /// <summary>
        /// 集合相互转换
        /// </summary>
        /// <typeparam name="T"></typeparam>
        public static class Convert<T> where T : new()
        {

            /// <summary>  
            /// DataTable 2 list
            /// </summary>  
            /// <param name="dt"></param>  
            /// <returns></returns>  
            public static List<T> ToList(DataTable dt)
            {
                // 定义集合  
                List<T> ts = new List<T>();
                // 获得此模型的类型  
                Type type = typeof(T);
                //定义一个临时变量  
                //遍历DataTable中所有的数据行  
                foreach (DataRow dr in dt.Rows)
                {
                    T t = new T();
                    // 获得此模型的公共属性  
                    PropertyInfo[] propertys = t.GetType().GetProperties();
                    //遍历该对象的所有属性  
                    foreach (PropertyInfo pi in propertys)
                    {
                        string tempName = pi.Name;
                        //检查DataTable是否包含此列（列名==对象的属性名）    
                        if (dt.Columns.Contains(tempName))
                        {
                            // 判断此属性是否有Setter  
                            if (!pi.CanWrite) continue;//该属性不可写，直接跳出  
                            //取值  
                            object value = Get_Safe_Str(dr[tempName]);
                            //如果非空，则赋给对象的属性  
                            if (value != DBNull.Value)
                                pi.SetValue(t, value, null);
                        }
                    }
                    //对象添加到泛型集合中  
                    ts.Add(t);
                }
                return ts;
            }
            /// <summary>    
            /// List 2 DataTable    
            /// </summary>    
            /// <typeparam name="T"></typeparam>    
            /// <param name="list"></param>    
            /// <returns></returns>    
            public static DataTable ToDataTable(IList<T> list)
            {
                List<PropertyInfo> pList = new List<PropertyInfo>(); // 创建属性的集合   
                Type type = typeof(T); // 获得反射的入口    
                DataTable dt = new DataTable();
                // 把所有的public属性加入到集合 并添加DataTable的列    
                Array.ForEach(type.GetProperties(), p => { pList.Add(p); dt.Columns.Add(p.Name, p.PropertyType); });
                foreach (var item in list)
                {
                    DataRow row = dt.NewRow();// 创建一个DataRow实例    

                    pList.ForEach(p => row[p.Name] = p.GetValue(item, null));  // 给row 赋值    

                    dt.Rows.Add(row); // 加入到DataTable    
                }
                return dt;
            }

        }
    }
}