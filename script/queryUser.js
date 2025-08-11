import mongoose from "mongoose"
import dotenv from "dotenv"
import Papa from "papaparse"
dotenv.config()

// 直接在本文件定义schema和model
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // 唯一
    },
    firstGroup: {
      type: String,
      required: true,
      unique: true,
    },
    subGroups: {
      type: [String],
      default: [],
    },
  },
  { collection: "users" }
)
const loginLogsSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    createTime: {
      type: Date,
      required: true,
    },
    result: {
      type: String,
      required: true,
    },
  },
  { collection: "login_logs" }
)

// Create models from schemas
const User = mongoose.model("User", userSchema)
const LoginLog = mongoose.model("LoginLog", loginLogsSchema)

// 3. 连接数据库
async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI
  await mongoose.connect(MONGO_URI)
}
// 4. 主处理逻辑
async function main() {
  await connectDB()
  // 设置查询参数
  const year = 2025
  const month = 7

  // 构建时间范围
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  // 核心查询：获取七月份有登录记录的用户名
  const activeUsernames = await LoginLog.distinct("username", {
    createTime: { $gte: startDate, $lte: endDate },
    result: "成功",
  }).lean()
  console.log("activeUsernames count:", activeUsernames.length)

  // 添加数据一致性校验
  const validActiveUsers = await User.countDocuments({
    username: { $in: activeUsernames },
  })
  const invalidActiveUsers = activeUsernames.length - validActiveUsers
  console.log("有效活跃用户数(存在于User集合中):", validActiveUsers)
  console.log(
    "无效活跃用户数(LoginLog中存在但User中不存在):",
    invalidActiveUsers
  )

  // 查找非活跃用户
  const inactiveUserCount = await User.countDocuments({
    username: { $nin: activeUsernames },
  })

  // 不返回 _id
  const inactiveUsers = await User.find(
    {
      username: { $nin: activeUsernames },
    },
    {
      username: 1,
      _id: 0,
      //   fullName: 1,
      //   firstGroup: 1,
      //   secondGroup: 1,
    }
  )
    .sort({ createTime: -1 })
    .lean()
  let a = inactiveUsers.map((item) => item.username)
  console.log("aaaaaaa", JSON.stringify(a))

  // 处理二级分组数组展开并转换为CSV
  const formattedData = inactiveUsers.map((user) => ({
    账户: user.username,
    姓名: user.fullName || "",
    一级分组: user.firstGroup,
    二级分组: (user.secondGroup || []).join(", "),
  }))

  const csv = Papa.unparse([
    ["账户", "姓名", "一级分组", "二级分组"],
    ...formattedData.map((item) => [
      item["账户"],
      item["姓名"],
      item["一级分组"],
      item["二级分组"],
    ]),
  ])

  //   console.log("非活跃用户CSV数据:")
  //   console.log(csv)
  //   const count = await inactiveUsers.countDocuments()
  // 输出User 数据数量
  const num = await User.countDocuments()
  // 显示结果
  //   console.log(`七月份非活跃用户数量: ${inactiveUserCount}`)
  //   console.log(`总用户数: ${num}`)
  //   console.log(`差异: ${validActiveUsers + count - num}`)

  mongoose.disconnect()
}

main().catch((err) => {
  console.error("脚本执行出错:", err)
  mongoose.disconnect()
})
