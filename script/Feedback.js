import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const APP_ID = "6823f72031492dfdc8bfade9" // 目标appId

// chatitems schema定义（只包含关心的字段）
const chatItemSchema = new mongoose.Schema(
  {
    appId: mongoose.Schema.Types.ObjectId,
    dataId: String,
    obj: String,
    userGoodFeedback: String,
    userBadFeedback: String,
  },
  { collection: "chatitems" }
)

const ChatItem = mongoose.model("ChatItem", chatItemSchema)

async function connectDB() {
  const MONGO_URI = process.env.MONGODB_URI
  await mongoose.connect(MONGO_URI)
  console.log("数据库连接成功")
}

async function main() {
  await connectDB()

  // 查询所有指定appId 和obj==='Human'的数据：chatitems
  //   遍历的数据：chatitems，根据每一项中的dataId&&obj==='AI'进行查询,
  // 如果查询到数据，则把userGoodFeedback和userBadFeedback转移到obj==='AI'的数据上
  const chatItems = await ChatItem.find({ appId: APP_ID, obj: "Human" })
  if (!chatItems.length) {
    console.log("未找到相关chatitems数据")
    return
  }
  console.log(`共找到 ${chatItems.length} 条数据`)
  for (const item of chatItems) {
    const dataId = item.dataId
    const aiItem = await ChatItem.findOne({ appId: APP_ID, dataId, obj: "AI" })
    if (aiItem && (item.userGoodFeedback || item.userBadFeedback)) {
      if (item.userGoodFeedback) {
        aiItem.userGoodFeedback = item.userGoodFeedback
      }
      if (item.userBadFeedback) {
        aiItem.userBadFeedback = item.userBadFeedback
      }
      await aiItem.save()
      item.userGoodFeedback = undefined
      item.userBadFeedback = undefined
      await item.save()
      console.log(`dataId= ${dataId} 处理完成`)
    }
    console.log(`dataId=${dataId} 不需要处理`)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error("脚本执行出错:", err)
  process.exit(1)
})
