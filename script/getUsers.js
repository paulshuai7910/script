import mongoose from "mongoose"
import dotenv from "dotenv"
import { connectDB, MongoUser } from "./utils/mongo.js"
dotenv.config()
import { errUser } from "./utils/index.js"
import fs from "fs/promises"

async function main() {
  await connectDB()
  try {
    // 提取errUser中的所有id
    const userIds = errUser.map((user) => user.id)
    console.log("查询的用户ID数量:", userIds.length)

    // 根据id查询用户数据，只返回指定字段
    const users = await MongoUser.find({
      _id: { $in: userIds },
    }).select("_id email fullName username")

    console.log("查询到的用户数量:", users.length)
    console.log("用户数据:", JSON.stringify(users, null, 2))
    // 添加写入JSON文件的代码 generate json 生成时间戳
    const timestamp = new Date().getTime()
    // 确保output文件夹存在
    try {
      await fs.mkdir("output", { recursive: true })
    } catch (err) {
      console.error("创建文件夹失败:", err)
    }
    try {
      await fs.writeFile(
        `output/output_${timestamp}.json`,
        JSON.stringify(users, null, 2)
      )
      console.log(`数据已成功写入output/output_${timestamp}.json文件`)
    } catch (err) {
      console.error("写入文件失败:", err)
    }
  } catch (error) {
    console.error("查询用户数据出错:", error)
  } finally {
    mongoose.disconnect()
  }
}
main().catch((err) => {
  console.error("脚本执行出错:", err)
  mongoose.disconnect()
})
