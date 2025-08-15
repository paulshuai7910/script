import dotenv from "dotenv"
import mysql from "mysql2/promise"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { getCurrentConfig, validateConfig } from "../config/database.js"

// 确保环境变量在导入其他模块之前加载
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 获取数据库配置
const dbConfig = getCurrentConfig()

// 连接MySQL数据库
async function connectMySQL() {
  try {
    // 验证配置
    validateConfig(dbConfig)

    console.log("正在连接MySQL数据库...")
    console.log("连接配置:", {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
    })

    const connection = await mysql.createConnection(dbConfig)
    console.log("MySQL 连接成功")
    return connection
  } catch (error) {
    console.error("MySQL 连接失败:", error.message)
    console.error("错误详情:", error)
    throw error
  }
}

// 获取前一天的数据
async function getChatbotHistoryData(connection) {
  try {
    // 查询前一天的数据，确保获取所有详情记录
    const query = `
      SELECT 
        ch.id,
        ch.created_time as session_created_time,
        ch.llm_session_id,
        ch.operator,
        ch.artificial_llm_id,
        ch.valuation_level,
        ch.valuation_content,
        chd.chatbot_input,
        chd.chatbot_output,
        chd.satisfaction,
        chd.engineer_name,
        chd.chatbot_type,
        chd.id as detail_id,
        chd.created_time as detail_created_time
      FROM chatbot_history ch
      INNER JOIN chatbot_history_detail chd ON ch.llm_session_id = chd.llm_session_id
      WHERE DATE(ch.created_time) >= DATE_SUB(CURRENT_DATE, INTERVAL 8 DAY)
      AND DATE(ch.created_time) <= CURRENT_DATE
      ORDER BY ch.created_time DESC, ch.llm_session_id, chd.created_time ASC
    `
    /*
前一天：DATE(DATE_SUB(NOW(), INTERVAL 1 DAY) 
当天：CURRENT_DATE
前6天：DATE_SUB(CURRENT_DATE, INTERVAL 5 DAY)
  AND DATE(ch.created_time) <= CURRENT_DATE

*/
    /*
chatbot_type：LLM,CHAT_CRM,CHAT_CUSTOMER
*/
    const [rows] = await connection.query(query)
    console.log(`查询到 ${rows.length} 条记录`)
    return rows
  } catch (error) {
    console.error("查询数据时出错:", error.message)
    throw error
  }
}

// 处理数据，将同一会话ID的多条记录合并
function processSessionData(rawData) {
  const sessionMap = new Map()

  rawData.forEach((row) => {
    const sessionId = row.llm_session_id

    if (!sessionMap.has(sessionId)) {
      // 创建新的会话记录
      sessionMap.set(sessionId, {
        id: row.id,
        session_created_time: row.session_created_time,
        llm_session_id: sessionId,
        operator: row.operator,
        artificial_llm_id: row.artificial_llm_id,
        valuation_level: row.valuation_level,
        valuation_content: row.valuation_content,
        engineer_name: row.engineer_name,
        session_details: [], // 存储所有详情记录
        customer_name: null, // 稍后填充
      })
    }

    // 添加详情记录
    const session = sessionMap.get(sessionId)
    session.session_details.push({
      chatbot_input: row.chatbot_input,
      chatbot_output: row.chatbot_output,
      satisfaction: row.satisfaction,
      detail_created_time: row.detail_created_time,
      chatbot_type: row.chatbot_type,
      engineer_name: row.engineer_name,
    })
  })

  // 转换为数组格式
  return Array.from(sessionMap.values())
}

// 获取客户名称
async function getCustomerNames(connection, operators) {
  try {
    if (!operators || operators.length === 0) return {}

    const uniqueOperators = [...new Set(operators.filter((op) => op))]
    if (uniqueOperators.length === 0) return {}

    const placeholders = uniqueOperators.map(() => "?").join(",")
    const query = `
      SELECT id, crm_name 
      FROM customer 
      WHERE id IN (${placeholders})
    `

    const [rows] = await connection.query(query, uniqueOperators)
    const customerMap = {}
    rows.forEach((row) => {
      customerMap[row.id] = row.crm_name
    })

    return customerMap
  } catch (error) {
    console.error("查询客户名称时出错:", error.message)
    return {}
  }
}

// 获取人工客服名称
async function getEngineerNames(connection, artificialIds) {
  try {
    if (!artificialIds || artificialIds.length === 0) return {}

    const uniqueIds = [...new Set(artificialIds.filter((id) => id))]
    if (uniqueIds.length === 0) return {}

    const placeholders = uniqueIds.map(() => "?").join(",")
    const query = `
      SELECT id, engineer_name 
      FROM chatbot_history_detail 
      WHERE id IN (${placeholders})
    `

    const [rows] = await connection.query(query, uniqueIds)
    const engineerMap = {}
    rows.forEach((row) => {
      engineerMap[row.id] = row.engineer_name
    })

    return engineerMap
  } catch (error) {
    console.error("查询人工客服名称时出错:", error.message)
    return {}
  }
}

// 格式化时间
function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return ""
  try {
    const date = new Date(dateTimeStr)
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  } catch (error) {
    return dateTimeStr
  }
}

// 格式化满意度评价
function formatSatisfaction(satisfaction) {
  if (satisfaction === null || satisfaction === undefined) return "未评价"
  if (satisfaction === 1) return "点赞"
  if (satisfaction === 2) return "点踩"
  return "未评价"
}

// 拼接会话详情
function formatSessionDetail(sessionDetails) {
  if (!sessionDetails || sessionDetails.length === 0) {
    return "无详情"
  }

  const detailParts = sessionDetails
    .map((detail, index) => {
      const parts = []
      if (detail.chatbot_type === "LLM") {
        if (detail.chatbot_input) {
          parts.push(`用户: ${detail.chatbot_input}`)
        }
        // 正则： detail.chatbot_input 不含 ‘转人工’
        if (detail.chatbot_output && !/转人工/.test(detail.chatbot_input)) {
          parts.push(`AI: ${detail.chatbot_output}`)
        }

        if (detail.satisfaction !== null && detail.satisfaction !== undefined) {
          parts.push(`满意度: ${formatSatisfaction(detail.satisfaction)}`)
        }
      }
      if (detail.chatbot_type === "CHAT_CRM") {
        if (detail.chatbot_input) {
          parts.push(`客服${detail.engineer_name}: ${detail.chatbot_input}`)
        }
      }

      if (detail.chatbot_type === "CHAT_CUSTOMER") {
        if (detail.chatbot_input) {
          parts.push(`用户: ${detail.chatbot_input}`)
        }
      }

      if (detail.chatbot_type === "CHAT_SYSTEM") {
        if (detail.chatbot_input) {
          parts.push(`系统: ${detail.chatbot_input}`)
        }
      }

      const detailStr = parts.join(" | ")
      return detailStr ? `记录${index + 1}: ${detailStr}` : null
    })
    .filter(Boolean)

  return detailParts.join("\n")
}

// 将数据转换为CSV格式
function convertToCSV(data) {
  if (!data || data.length === 0) return ""

  // 定义CSV列头
  const headers = [
    "会话创建时间",
    "会话ID",
    "客户名称",
    "会话详情",
    "是否转人工",
    // "人工客服名称",
    "人工会话点评",
    "人工会话差评反馈",
  ]

  // 生成CSV内容
  const csvRows = [headers.join(",")]

  data.forEach((row) => {
    const csvRow = [
      `"${formatDateTime(row.session_created_time)}"`,
      `"${row.llm_session_id || ""}"`,
      `"${row.customer_name || ""}"`,
      `"${formatSessionDetail(row.session_details).replace(/"/g, '""')}"`,
      `"${row.artificial_llm_id ? "是" : "否"}"`,
      // `"${row.engineer_name || ""}"`,
      `"${row.valuation_level || ""}"`,
      `"${(row.valuation_content || "").replace(/"/g, '""')}"`,
    ]
    csvRows.push(csvRow.join(","))
  })

  return csvRows.join("\n")
}

// 保存CSV文件
function saveCSVFile(csvContent, filename) {
  try {
    const outputDir = path.join(__dirname, "..", "output")
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const filePath = path.join(outputDir, filename)
    fs.writeFileSync(filePath, "\uFEFF" + csvContent, "utf8")
    console.log(`CSV文件已保存到: ${filePath}`)
    return filePath
  } catch (error) {
    console.error("保存CSV文件时出错:", error.message)
    throw error
  }
}

// 主函数
async function main() {
  let connection
  try {
    // 连接数据库
    connection = await connectMySQL()

    // 获取聊天机器人历史数据
    const rawData = await getChatbotHistoryData(connection)

    if (rawData.length === 0) {
      console.log("没有找到前一天的数据")
      return
    }

    // 处理数据，将同一会话ID的多条记录合并
    const processedData = processSessionData(rawData)

    // 获取客户名称映射
    const operators = processedData.map((row) => row.operator)
    const customerMap = await getCustomerNames(connection, operators)

    // 获取人工客服名称映射
    // const artificialIds = processedData.map((row) => row.artificial_llm_id)
    // const engineerMap = await getEngineerNames(connection, artificialIds)

    // 处理数据，填充客户名称和人工客服名称
    const finalData = processedData.map((row) => ({
      ...row,
      customer_name: customerMap[row.operator] || row.operator || "",
      is_artificial: row.artificial_llm_id ? "是" : "否",
      // engineer_name: row.artificial_llm_id
      //   ? engineerMap[row.artificial_llm_id] || ""
      //   : "",
    }))

    // 转换为CSV格式
    const csvContent = convertToCSV(finalData)

    // 生成文件名
    const timestamp = Date.now()
    const filename = `aiforce_export_${timestamp}.csv`

    // 保存CSV文件
    const filePath = saveCSVFile(csvContent, filename)

    console.log(`数据导出完成！共导出 ${finalData.length} 条记录`)
  } catch (error) {
    console.error("程序执行出错:", error.message)
  } finally {
    if (connection) {
      await connection.end()
      console.log("数据库连接已关闭")
    }
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { main, connectMySQL, getChatbotHistoryData }
