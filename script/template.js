import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

// 3. 连接数据库
async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI
  await mongoose.connect(MONGO_URI)
  console.log("数据库连接成功")
}
// 4. 主处理逻辑
async function main() {
  await connectDB()
}

main().catch((err) => {
  console.error("脚本执行出错:", err)
  mongoose.disconnect()
})
