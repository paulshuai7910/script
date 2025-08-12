import mongoose from "mongoose"
import crypto from "crypto"
import dotenv from "dotenv"
import fs from "fs/promises"
import { fullUser } from "./utils/index.js"

dotenv.config()
const errorCodeMap = {
  "USS-0100": "email 无效",
  "USS-0104": "email 已注册",
  "USS-0121": "realm 无效",
  "USS-0135": "请求参数无效",
  "USS-0141": "链接已过期",
  "USS-0607": "签名无效",
}
const generateSignature = (username, realm, publicKey) => {
  const rawString = username.trim().toLowerCase() + realm + publicKey
  return crypto.createHash("sha256").update(rawString).digest("hex")
}
function getErrorMessageByCode(code) {
  return errorCodeMap[code] || "Unknown error code."
}
async function registerByLenovoId({ email, fullName }) {
  try {
    const API_URL = "https://sdcsso.lenovo.com/webauthn/accountRegister"
    const PUBLIC_KEY =
      "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtzJC2SoEkPTGf0NC6ruPq5GL0RKf7p9Fbyx9HsXIe4gK6G26tP7V0xaJoNQLJJEtMhEZvlqMiYcdVLt7aRv-yM9Zp6Gaawl-9dPLniCwWzLNjstwe2NqA9X47ZFjXDBm4ezgjsnC6HgGU_6nwXMZVmPNUEr0m_7qqUhCvw4DbC0Mvn3EENwjdG1CSi1N1RvDfCKT3IV9fdpYf7vtLhzR5N1b_A34kfFMiQ68-rpaWPwQp2L7fv-gvSuTxWNkkj3sWBz34-8-29jrhbRBHK6OQ9FGa5F-E7mana4BEiiaVpKebEXVldH3LMbfsZcg7-b8hxkATkNU0yVX_G43ESgQEwIDAQAB"
    const CALLBACK_URL = "https://agent.cube.lenovo.com/login" // 生成签名 use crypto
    const firstName = fullName.substring(0, 1)
    const lastName = fullName.substring(1)
    const params = new URLSearchParams()
    params.append("username", email)
    params.append("webauthn_lang", "zh_CN")
    params.append("webauthn_source", "https://agent.cube.lenovo.com")
    params.append("webauthn_callback", CALLBACK_URL)
    params.append("webauthn_realm", "ai_service_agent")
    params.append("firstName", firstName)
    params.append("lastName", lastName)
    params.append(
      "signature",
      generateSignature(email, "ai_service_agent", PUBLIC_KEY)
    )
    const response = await fetch(API_URL, {
      method: "POST",
      body: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    const data = await response.json()
    let msg = "lenovoID 注册成功"
    if (response.status === 400) {
      msg = getErrorMessageByCode(data.Code)
    }
    if (response.status >= 500) {
      msg = "服务端发生错误"
    }
    return msg
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return errorMessage
  }
}

// 1. 定义User Schema（只需包含你关心的字段即可）
const userSchema = new mongoose.Schema(
  {
    email: String,
    fullName: String,
    username: String,
  },
  { collection: "users" }
) // 指定集合名

// 2. 创建Model
const User = mongoose.model("User", userSchema)

// 3. 连接数据库
async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI
  await mongoose.connect(MONGO_URI)
  console.log("数据库连接成功")
}

// 4. 主处理逻辑
async function main() {
  await connectDB()

  // 查询所有用户
  // const users = await User.find()
  // console.log(`共找到 ${users.length} 个用户`)
  let index = 0
  let successMessage = [],
    errorMessage = [],
    errorUserIds = [],
    successUserIds = [],
    serverErrorUserIds = [],
    alreadyRegisteredUserIds = [],
    notExistUserIds = []
  for (const user of fullUser) {
    index++
    console.log("index", index)
    const email = user.email
    const fullName = user.fullName || user.username
    if (!email || !fullName) {
      notExistUserIds.push({
        id: user._id,
        description: "email or fullname not exist",
      })
      continue
    }
    try {
      const result = await registerByLenovoId({ email, fullName })
      console.log(`用户 ${user._id}`)
      if (result === "lenovoID 注册成功") {
        successUserIds.push({
          id: user._id,
          email,
          description: "lenovoID 注册成功",
        })
      } else if (result === "服务端发生错误") {
        serverErrorUserIds.push({
          id: user._id,
          email,
          description: "服务端发生错误",
        })
      } else if (result === "email 已注册") {
        alreadyRegisteredUserIds.push({
          id: user._id,
          email,
          description: "email 已注册",
        })
      } else {
        errorMessage.push({
          id: user._id,
          email,
          fullName,
          username: user.username,
          description: result,
        })
      }
    } catch (err) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      errorUserIds.push({ id: user._id, email, err: errorMessage })
    }
  }
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
      JSON.stringify(
        {
          successMessage,
          errorMessage,
          errorUserIds,
          successUserIds,
          serverErrorUserIds,
          alreadyRegisteredUserIds,
        },
        null,
        2
      )
    )
    console.log(`数据已成功写入output/output_${timestamp}.json文件`)
  } catch (err) {
    console.error("写入文件失败:", err)
  }
  mongoose.disconnect()
}

main().catch((err) => {
  console.error("脚本执行出错:", err)
  mongoose.disconnect()
})
