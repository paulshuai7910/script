import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
const { Schema } = mongoose
const ChatItemSchema = new mongoose.Schema(
  {
    responseData: {
      type: Array,
      default: [],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    chatId: {
      type: String,
      require: true,
    },
    obj: {
      // chat role
      type: String,
      required: true,
    },
    value: {
      // chat content
      type: Array,
      default: [],
    },
  },
  { collection: "chatitems" }
)
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
    secondGroup: {
      type: [String],
      default: [],
    },
  },
  { collection: "users" }
)
const tracksSchema = new Schema({
  event: { type: String, required: true },
  uid: String,
  teamId: String,
  tmbId: String,
  createTime: { type: Date, default: () => new Date() },
  data: Object,
})
export const MongoTracks = mongoose.model("tracks", tracksSchema)
export const MongoUser = mongoose.model("users", userSchema)
export const MongoChatItems = mongoose.model("chatitems", ChatItemSchema)
export async function connectDB() {
  try {
    const MONGO_URI = process.env.MONGO_URI
    await mongoose.connect(MONGO_URI)
    console.log("数据库连接成功")
  } catch (error) {
    console.error("数据库连接失败:", error)
  }
}
