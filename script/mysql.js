import dotenv from "dotenv"

dotenv.config()
import mysql from "mysql2/promise"

// database: "lenovo_af_db_customer",
async function connectMySQL() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: "lenovo_af_db_customer",
      port: process.env.MYSQL_PORT,
    })
    console.log("MySQL 连接成功")
    return connection
    // await connection.end()
  } catch (error) {
    console.error("MySQL 连接失败:", error.message)
  }
}

async function printAllTableNames() {
  try {
    const connection = await connectMySQL()
    const [rows] = await connection.query("SHOW TABLES")
    const tableNames = rows.map((row) => Object.values(row)[0])
    console.log("数据库中的所有表名：", tableNames)

    await connection.end()
  } catch (error) {
    console.error("获取表名时出错：", error)
  }
}

printAllTableNames()
