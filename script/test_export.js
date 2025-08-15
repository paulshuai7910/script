import {
  main,
  connectMySQL,
  getChatbotHistoryData,
} from "./lenovo_af_db_customer.js"

// 测试函数
async function testExport() {
  console.log("开始测试数据导出功能...")

  try {
    // 测试主函数
    console.log("\n=== 测试主函数 ===")
    await main()

    console.log("\n=== 测试完成 ===")
  } catch (error) {
    console.error("测试过程中出现错误:", error.message)
  }
}

// 运行测试
testExport()
