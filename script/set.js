import mongoose from "mongoose"
import { customAlphabet } from "nanoid"
import dotenv from "dotenv"

dotenv.config()

const getNanoid = (size = 12) => {
  const firstChar = customAlphabet("abcdefghijklmnopqrstuvwxyz", 1)()

  if (size === 1) return firstChar

  const randomsStr = customAlphabet(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
    size - 1
  )()

  return `${firstChar}${randomsStr}`
}
// ====== MongoDB连接 ======
const { Schema } = mongoose

// ====== App Schema ======
const AppSchema = new Schema({
  name: String,
  teamId: Schema.Types.ObjectId,
  tmbId: Schema.Types.ObjectId,
  type: String,
  version: String,
  avatar: String,
  intro: String,
  guideLink: String,
  updateTime: Date,
  teamTags: [String],
  modules: Array,
  edges: Array,
  chatConfig: Object,
  pluginData: Object,
  scheduledTriggerConfig: Object,
  scheduledTriggerNextTime: Date,
  inited: Boolean,
  inheritPermission: Boolean,
  defaultPermission: Number,
})
const MongoApp = mongoose.models.apps || mongoose.model("apps", AppSchema)

// ====== Chat Schema ======
const ChatSchema = new Schema({
  chatId: String,
  userId: Schema.Types.ObjectId,
  teamId: Schema.Types.ObjectId,
  tmbId: Schema.Types.ObjectId,
  appId: Schema.Types.ObjectId,
  updateTime: Date,
  title: String,
  customTitle: String,
  top: Boolean,
  source: String,
  sourceName: String,
  shareId: String,
  outLinkUid: String,
  variableList: Array,
  welcomeText: String,
  variables: Object,
  pluginInputs: Array,
  metadata: Object,
})
const MongoChat = mongoose.models.chat || mongoose.model("chat", ChatSchema)

// ====== ChatItem Schema ======
const ChatItemSchema = new Schema({
  teamId: Schema.Types.ObjectId,
  tmbId: Schema.Types.ObjectId,
  userId: Schema.Types.ObjectId,
  chatId: String,
  dataId: String,
  appId: Schema.Types.ObjectId,
  time: Date,
  hideInUI: Boolean,
  obj: String,
  value: Array,
  userGoodFeedback: String,
  userBadFeedback: String,
  customFeedbacks: [String],
  adminFeedback: Object,
  nodeResponse: Array,
  groupId: String,
  isFavorite: Boolean,
  favorite: Object,
})
const MongoChatItem =
  mongoose.models.chatitems || mongoose.model("chatitems", ChatItemSchema)

/*
1. 遍历apps collection, 获取appId
2. get all chat ID by appId at chats collection
3. get all chatitems by chatId at chatitems collection
4. output chatitems 数量为奇数的chatId
*/
async function connectDB() {
  const MONGO_URI = process.env.MONGODB_URI
  await mongoose.connect(MONGO_URI)
  console.log("数据库连接成功")
}

async function main() {
  await connectDB()
  // 1. 获取所有appId
  const apps = await MongoApp.find({}, "_id name").lean()
  for (const app of apps) {
    const appId = app._id
    const items = await MongoChatItem.countDocuments({ appId })
    console.log(`appId: ${appId} 总数量: ${items}`)
    // 2. 获取该app下所有chatId
    // const chats = await MongoChat.find({ appId }, "chatId").lean()
    // for (const chat of chats) {
    //   const chatId = chat.chatId
    //   // 3. 获取该chatId下所有chatitems数量
    //   const items = await MongoChatItem.find({ chatId, appId }).sort({ _id: 1 })
    //   console.log(`chatId: ${chatId} 总数量: ${items.length}`)
    //   if (items.length % 2 !== 0) {
    //     console.log("items 长度为奇数，chatId:", chatId, "appId:", appId)
    //   } else {
    //     for (let i = 0; i < items.length; i += 2) {
    //       if (i + 1 < items.length) {
    //         const groupId = getNanoid(24)
    //         items[i].groupId = groupId
    //         items[i + 1].groupId = groupId
    //         await items[i].save()
    //         await items[i + 1].save()
    //       }
    //     }
    //   }
    // }
  }
  mongoose.disconnect()
}

main().catch((err) => {
  console.error("脚本执行出错:", err)
  process.exit(1)
})
