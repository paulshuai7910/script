import mongoose from "mongoose"
import dotenv from "dotenv"
import { connectDB, MongoUser } from "./utils/mongo.js"
dotenv.config()

async function getApiHubToken() {
  const options = {
    method: "POST",
    url: process.env.APIHUB_DOMAIN + "/token",
    headers: {
      "X-API-KEY": process.env.APIHUB_API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    form: {
      username: process.env.APIHUB_USERNAME,
      password: process.env.APIHUB_PASSWORD,
    },
  }

  try {
    const formData = new URLSearchParams()
    formData.append("username", options.form.username)
    formData.append("password", options.form.password)

    // 在Windows环境下禁用SSL证书验证
    if (process.platform === "win32") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
    }

    const response = await fetch(options.url, {
      method: options.method,
      headers: {
        "X-API-KEY": options.headers["X-API-KEY"],
        "Content-Type": options.headers["Content-Type"],
        Cookie: options.headers["Cookie"],
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status},message: ${response.statusText}`
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    throw new Error(`获取API token失败:${error}`)
  }
}

async function getEngineerInfoByUser(usernames, token) {
  try {
    const apiUrl = new URL(
      `${process.env.APIHUB_DOMAIN + process.env.APIHUB_API_URL}`
    )
    const headers = {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.APIHUB_API_KEY,
      Authorization: `Bearer ${token}`,
    }

    // 在Windows环境下禁用SSL证书验证
    if (process.platform === "win32") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
    }
    console.log("4----")
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify([...usernames]),
    })
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status},message: ${response.statusText}`
      )
    }
    const data = await response.json()
    return data
  } catch (error) {
    // 修复：将未定义的username改为usernames
    throw new Error(`请求用户列表时出错:${error.message}`)
  }
}
async function main() {
  await connectDB()
  try {
    // 1. 获取API token
    const tokenResponse = await getApiHubToken()
    if (!tokenResponse.access_token) {
      throw new Error("获取API token失败")
    }
    // 2. 获取远程技术支持用户
    const users = await MongoUser.find({
      firstGroup: { $in: ["远程技术支持中心", "渠道"] },
    })
      .select("username status -_id") // 只返回username，status字段
      .lean()
    if (users.length === 0) {
      return []
    }
    const userNames = users.map((item) => item["username"])
    // 优化：当用户数量超过100时，分批请求
    const batchSize = 100
    const allData = []
    for (let i = 0; i < userNames.length; i += batchSize) {
      const batch = userNames.slice(i, i + batchSize)
      const batchData = await getEngineerInfoByUser(
        batch,
        tokenResponse.access_token
      )
      if (batchData.statusCode === 200 && batchData.data.length > 0) {
        allData.push(...batchData.data)
      }

      allData.push(batchData)
    }
    // console.log("data---", JSON.stringify(allData))
    mongoose.disconnect()
  } catch (error) {
    console.error("脚本执行出错:", error.message)
  }
}
main().catch((err) => {
  console.error("脚本执行出错:", err)
  mongoose.disconnect()
})
