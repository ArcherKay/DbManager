using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using Dapper;
using DbManager.Models;
namespace DbManager.Common
{
    public class TableHelper
    {
        static string ConnString = $"Data Source={ConfigHelper.GetValue("DbServerAddress")};Initial Catalog={ConfigHelper.GetValue("DbName")};User ID={ConfigHelper.GetValue("DbLoginUser")};Password={ConfigHelper.GetValue("DbLoginPwd")}";
        /// <summary>
        /// 获取数据库中所有表备注信息
        /// </summary>
        /// <returns></returns>
        public static List<DatabaseTable> GetAllTables()
        {
            using (SqlConnection con = new SqlConnection(ConnString))
            {
                const string query = "select top 1000 " +
                                     "a.name AS TableName," +
                                     "isnull(g.[value], '-') AS TableDesc " +
                                     "from " +
                                     "sys.tables a left " +
                                     "join sys.extended_properties g " +
                                     "on (a.object_id = g.major_id AND g.minor_id = 0) ";
                return con.Query<DatabaseTable>(query).ToList();
            }
        }
        /// <summary>
        /// 根据表名获取表结构
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        public static List<TableStruct> GetTableStruct(string tableName)
        {
            using (SqlConnection con = new SqlConnection(ConnString))
            {
                string query = @"select
                                c.name as [FieldName],t.name as [FieldType]
                                ,convert(bit,c.IsNullable)  as [IsNull]
                                ,convert(bit,case when exists(select 1 from sysobjects where xtype='PK' and parent_obj=c.id and name in (
                                    select name from sysindexes where indid in(
                                        select indid from sysindexkeys where id = c.id and colid=c.colid))) then 1 else 0 end) 
                                            as [IsPK]
                                ,convert(bit,COLUMNPROPERTY(c.id,c.name,'IsIdentity')) as [IsSelfGrowth]
                                ,c.Length as [BytesOccupied] 
                                ,COLUMNPROPERTY(c.id,c.name,'PRECISION') as [FieldLength]
                                ,isnull(COLUMNPROPERTY(c.id,c.name,'Scale'),0) as [FieldBit]
                                ,ISNULL(CM.text,'') as [FieldDefault]
                                ,isnull(ETP.value,'-') AS [FieldDesc]
                            from syscolumns c
                            inner join systypes t on c.xusertype = t.xusertype 
                            left join sys.extended_properties ETP on ETP.major_id = c.id and ETP.minor_id = c.colid and ETP.name ='MS_Description' 
                            left join syscomments CM on c.cdefault=CM.id
                            where c.id = object_id('" + tableName + "')";
                return con.Query<TableStruct>(query).ToList();
            }
        }
    }
}