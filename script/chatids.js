import mongoose from "mongoose"
import dotenv from "dotenv"
import fs from "fs/promises"
import { connectDB, MongoChatItems } from "./utils/mongo.js"
dotenv.config()

let chatIds = {
  chatId: {
    $in: [
      "jSvc2arXJ7kjfsbyAsA4fsYK",
      "muUnb8h5bdyw8TaTapFPw8Ii",
      "wh74Cebn5DFV1NRSfdUSLlje",
      "mbzhQW5YT3MpbJgMx1LNNsDg",
      "yH8pHGWnyHeyriq5CrgDKYcd",
      "a6aTqTipxriBICgyxWY0I7kG",
      "vsZoXfmp9vJ83R112oxjLbwd",
      "sGvWYXAaRfaQ0YdUaIIkrqWE",
      "bpoUiaFWpXOuM3cIFH64soF7",
      "xpdqC0MifPQbv4cSq52FSQhP",
      "wmRlODXfbsTDk6N50l2jaL2E",
      "ruSTaS8SLVGEPDEDPMBUf96z",
      "bC40x0qTCYzdtANMFNsVLL66",
      "zgAU2OXadxrfmeXBSVc8xbGQ",
      "bQAjJYOatTdUEiK6Qs28tm3j",
      "cuf7XusAg1F2on1Opn1Fq1mx",
      "uHjUD7y1OX0f9qSkVCiHQ0Vf",
      "z1rGfXhjGnV18fyICc8UlUZQ",
      "quwqGAEg0nhOY5xH2P9fz5xR",
      "wbjjsDqqaGXxeOsDzRj7U5h7",
      "nUdsRdFotNrHDLsDlSse9Kb1",
      "ytPPxbvELzfVqLLvRpRJYrPN",
      "jwYv3CgClRBhalLrALPuAa69",
      "obQgGXGIdmzZx5VRFFm95HfQ",
      "vTWGVKrCNL3U0jE8ySxu6ehb",
      "p1zOVAbinh0a7BFDoIQafqYw",
      "rlfHSFYzFzXtUM2J6oX8LIUi",
      "jNyMgqsEZqvaHyx7QoZunjlZ",
      "mKcmXTutgJCcAZ9u2tRGCB5h",
      "zcSbJVCtsgq9PHEW3ol2yeH3",
    ],
  },
}

async function main() {
  await connectDB()
  const documents = await MongoChatItems.find(chatIds).sort({ _id: 1 })
  let datas = []
  // 按照奇数索引循环（i=0, 2, 4...）
  for (let i = 0; i < documents.length; i += 2) {
    // 打印documents[i].value[0].text.content
    let data = {
      question: documents[i].value[0].text.content,
      qwen3_30B: null,
      qwq: null,
    }

    // 检查i+1是否超出数组范围
    if (i + 1 < documents.length) {
      // 查找moduleName为"使用RAG回答-qwen3_30B"的项
      const a = documents[i + 1].responseData.find(
        (item) => item.moduleName === "使用RAG回答-qwen3_30B"
      )

      if (a) {
        data.qwen3_30B = a
      }

      // 查找moduleName为"使用RAG回答_qwq"的项
      const b = documents[i + 1].responseData.find(
        (item) => item.moduleName === "使用RAG回答_qwq"
      )
      if (b) {
        data.qwq = b
      }
    } else {
      console.log("没有对应的响应数据")
    }
    datas.push(data)
  }

  // 添加写入JSON文件的代码 generate json 生成时间戳
  const timestamp = new Date().getTime()
  try {
    await fs.writeFile(
      `output_${timestamp}.json`,
      JSON.stringify(datas, null, 2)
    )
    console.log(`数据已成功写入output_${timestamp}.json文件`)
  } catch (err) {
    console.error("写入文件失败:", err)
  }

  mongoose.disconnect()
}

main().catch((err) => {
  console.error("脚本执行出错:", err)
  mongoose.disconnect()
})
