// 数据库配置文件
export const databaseConfigs = {
  // 测试环境
  test: {
    host: "172.101.10.20",
    user: "root",
    password: "PWD_yt.QRp)kW6hPQ",
    database: "lenovo_af_db_customer",
    port: 33306,
    charset: "utf8mb4",
    timezone: "+08:00",
    connectTimeout: 60000,
  },

  // 生产环境 (示例)
  production: {
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "lenovo_af_db_customer",
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    charset: "utf8mb4",
    timezone: "+08:00",
    connectTimeout: 60000,
  },
}

// 获取当前环境配置
export function getCurrentConfig() {
  const env = process.env.NODE_ENV || "test"
  return databaseConfigs[env] || databaseConfigs.test
}

// 验证配置
export function validateConfig(config) {
  const required = ["host", "user", "password", "database", "port"]
  const missing = required.filter((key) => !config[key])

  if (missing.length > 0) {
    throw new Error(`缺少必需的数据库配置: ${missing.join(", ")}`)
  }

  return true
}
