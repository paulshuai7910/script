import mongoose from "mongoose"
import dotenv from "dotenv"
import { connectDB, MongoUser, MongoTracks } from "./utils/mongo.js"
import fs from "fs"
import path from "path"

dotenv.config()
async function main() {
  await connectDB()
  const users = await MongoUser.find({
    firstGroup: { $in: ["远程技术支持中心", "渠道"] },
  })
    .select("username fullName firstGroup secondGroup _id") // 只返回username，status字段,
    .lean()
  if (users.length === 0) {
    return []
  }
  const userIds = users.map((item) => item["_id"])
  // 根据id查询用户数据，只返回指定字段
  const tracksData = await MongoTracks.find({
    uid: { $in: userIds },
  })
    .select("_id event uid teamId tmbId createTime data")
    .lean()
  let exportuser = []
  tracksData.forEach((item) => {
    exportuser.push({
      ...item,
      username: users.find((user) => user._id == item.uid)?.username,
      fullName: users.find((user) => user._id == item.uid)?.fullName,
      firstGroup: users.find((user) => user._id == item.uid)?.firstGroup,
      secondGroup: users
        .find((user) => user._id == item.uid)
        ?.secondGroup?.join(","),
    })
  })
  /*
  exportuser
   时间：item.createTime，使用者:item.fullName,账户:item.username，
   登录方式:item.data.type，一级分组:item.firstGroup，二级分组:item.subGroups
  */

  // 生成CSV内容
  const headers = ["时间", "使用者", "账户", "登录方式", "一级分组", "二级分组"]
  const csvContent = [
    headers.join(","), // 表头
    ...exportuser.map((item) =>
      [
        item.createTime?.toLocaleString(),
        item.fullName || "",
        item.username || "",
        item.data?.type || "",
        item.firstGroup || "",
        item.secondGroup || "",
      ].join(",")
    ),
  ].join("\n")

  // 确保output文件夹存在
  const __dirname = path.dirname(new URL(import.meta.url).pathname)
  const outputDir = path.join(__dirname, "..", "output")
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // 写入CSV文件
  const timestamp = new Date().getTime()
  const csvFilePath = path.join(outputDir, `export_${timestamp}.csv`)
  fs.writeFileSync(csvFilePath, csvContent, "utf8")

  console.log(`数据已成功导出到CSV文件: ${csvFilePath}`)
  mongoose.disconnect()
}
main().catch((err) => {
  console.error("脚本执行出错:", err)
  mongoose.disconnect()
})
