﻿using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Web;

namespace DbManager.Common
{
    public class MsSql
    {
        #region 数据库操作
        /// <summary>
        /// 数据库连接字符串
        /// </summary>
        /// <returns></returns>
        public static SqlConnection CreateConn()
        {
            return new SqlConnection(GetConnString());
        }

        /// <summary>
        /// 获取数据库连接字符串
        /// </summary>
        /// <returns></returns>
        public static string GetConnString()
        {
            var connectStr = $"Data Source={Config.GetValue("DbServerAddress")};Initial Catalog={Config.GetValue("DbName")};User ID={Config.GetValue("DbLoginUser")};Password={Config.GetValue("DbLoginPwd")}";
            return connectStr;
        }

        public static void OpenConn(SqlConnection conn)
        {
            if (conn.State == ConnectionState.Closed)
            {
                conn.Open();
            }
        }
        public static int ExecuteNonQuery(SqlConnection connection, string cmdText)
        {
            return ExecuteNonQuery(connection, CommandType.Text, cmdText, null);
        }
        public static int ExecuteNonQuery(SqlConnection connection, string cmdText, params SqlParameter[] commandParameters)
        {
            return ExecuteNonQuery(connection, CommandType.Text, cmdText, commandParameters);
        }
        public static int ExecuteNonQuery(SqlConnection connection, CommandType cmdType, string cmdText, params SqlParameter[] commandParameters)
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandTimeout = 3600;
            PrepareCommand(cmd, connection, null, cmdType, cmdText, commandParameters);
            int val = cmd.ExecuteNonQuery();
            cmd.Parameters.Clear();
            CloseConn(connection);
            return val;
        }

        public static DataTable ExecuteDataTable(SqlConnection connection, string commandText)
        {
            return ExecuteDataTable(connection, CommandType.Text, commandText, null);
        }
        public static DataTable ExecuteDataTable(SqlConnection connection, CommandType commandType, string commandText, params SqlParameter[] commandParameters)
        {
            DataSet ds = ExecuteDataset(connection, commandType, commandText, commandParameters);
            CloseConn(connection);
            return ds == null || ds.Tables.Count == 0 ? new DataTable() : ds.Tables[0];
        }

        public static DataSet ExecuteDataset(SqlConnection connection, CommandType commandType, string commandText, params SqlParameter[] commandParameters)
        {
            SqlCommand cmd = new SqlCommand();
            PrepareCommand(cmd, connection, (SqlTransaction)null, commandType, commandText, commandParameters);
            SqlDataAdapter da = new SqlDataAdapter(cmd);
            DataSet ds = new DataSet();
            da.Fill(ds);       
            cmd.Parameters.Clear();
            CloseConn(connection);
            return ds;
        }
        private static void PrepareCommand(SqlCommand cmd, SqlConnection conn, SqlTransaction trans, CommandType cmdType, string cmdText, SqlParameter[] cmdParms)
        {
            if (conn.State != ConnectionState.Open)
            {
                conn.Open();
            }
            cmd.Connection = conn;
            cmd.CommandText = cmdText;

            //判断是否需要事物处理
            if (trans != null)
                cmd.Transaction = trans;

            cmd.CommandType = cmdType;

            if (cmdParms != null)
            {
                foreach (SqlParameter parm in cmdParms)
                {
                    if (parm != null)
                    {
                        // Check for derived output value with no value assigned
                        if ((parm.Direction == ParameterDirection.InputOutput ||
                            parm.Direction == ParameterDirection.Input) &&
                            (parm.Value == null))
                        {
                            parm.Value = DBNull.Value;
                        }
                        cmd.Parameters.Add(parm);
                    }
                }

            }
        }
        public static void CloseConn(SqlConnection conn)
        {
            if (conn.State == ConnectionState.Open)
            {
                conn.Close();
            }
        }

        #endregion

        /// <summary>
        /// 获取数据库中所有表备注信息
        /// </summary>
        /// <returns></returns>
        public static DataTable GetAllTables()
        {
            using (SqlConnection con = CreateConn())
            {
                const string query = "select top 1000 " +
                                     "a.name AS TableName," +
                                     "isnull(g.[value], '-') AS TableDesc " +
                                     "from " +
                                     "sys.tables a left " +
                                     "join sys.extended_properties g " +
                                     "on (a.object_id = g.major_id AND g.minor_id = 0) ";
                return ExecuteDataTable(con, query);
            }
        }

        /// <summary>
        /// 更新表说明
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="desc"></param>
        public static string TableDescUpdate(string tableName, string desc)
        {
            string message = "修改成功";
            using (SqlConnection conn = CreateConn())
            {
                OpenConn(conn);
                try
                {
                    StringBuilder sb = new StringBuilder();

                    sb.AppendFormat(
                        "IF ((SELECT COUNT(1) from fn_listextendedproperty('MS_Description','SCHEMA', N'dbo','TABLE', N'{0}',NULL, NULL)) > 0) ",
                        tableName);

                    sb.AppendFormat(
                        "EXEC sp_updateextendedproperty N'MS_Description',N'{0}','SCHEMA',N'dbo','TABLE',N'{1}',NULL,NULL ", desc, tableName);

                    sb.Append("ELSE ");

                    sb.AppendFormat(
                        "EXEC sp_addextendedproperty N'MS_Description',N'{0}','SCHEMA',N'dbo','TABLE',N'{1}',NULL,NULL ", desc, tableName);

                    ExecuteNonQuery(conn, sb.ToString());              
                }
                catch (Exception ex)
                {
                    message = ex.Message;
                }
                finally
                {
                    conn.Close();
                }
                return message;
            }
        }

        /// <summary>
        /// 根据表名获取表结构
        /// </summary>
        /// <param name="tableName"></param>
        /// <returns></returns>
        public static DataTable GetTableStruct(string tableName)
        {
            using (SqlConnection con = CreateConn())
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

                return ExecuteDataTable(con, query);

            }

        }

        /// <summary>
        /// 更新字段描述
        /// </summary>
        /// <param name="tableName"></param>
        /// <param name="fieldName"></param>
        /// <param name="desc"></param>
        /// <returns></returns>
        public static string FieldDescUpdate(string tableName, string fieldName, string desc)
        {
            string message = "修改成功";
            using (SqlConnection conn = CreateConn())
            {
                OpenConn(conn);
                try
                {
                    StringBuilder sb = new StringBuilder();
                    sb.AppendFormat(
                        "IF ((SELECT COUNT(1) from fn_listextendedproperty('MS_Description','SCHEMA', N'dbo','TABLE', N'{0}','COLUMN', N'{1}')) > 0) ",
                        tableName, fieldName);

                    sb.AppendFormat(
                        "EXEC sp_updateextendedproperty N'MS_Description',N'{2}','SCHEMA',N'dbo','TABLE',N'{0}','COLUMN',N'{1}' ", tableName, fieldName, desc);

                    sb.Append("ELSE ");

                    sb.AppendFormat(
                        "EXEC sp_addextendedproperty N'MS_Description',N'{0}','SCHEMA',N'dbo','TABLE',N'{1}','COLUMN',N'{2}' ",
                        desc, tableName, fieldName);

                    ExecuteNonQuery(conn, sb.ToString());           
                }
                catch (Exception ex)
                {
                    message = ex.Message;
                }
                finally
                {
                    conn.Close();
                }
            }
            return message;
        }
    }
}