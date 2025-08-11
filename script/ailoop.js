import { getSystemTime, getNanoid } from "./utils/index.js"

async function fetchWithRetry(requestNumber, chatId) {
  console.log(`发起请求次数: ${requestNumber}`)
  const params = {
    messages: [
      {
        dataId: getNanoid(24),
        hideInUI: false,
        role: "user",
        content:
          "翻译为英文：职场新人怕手忙脚乱？拯救者 M6Xpro 当你的“职场搭子”PAW 3395 传感器精准点选表格核对、PPT 调整不返工有线/2.4G/蓝牙 三模链接桌面清爽，开会携行超方便持久续航 + Type-C 快充人体工学握感，久坐办公手腕不酸M6Xpro，陪职场新人从容闯格子间",
      },
    ],
    variables: {
      userQuestion: "",
      useDS: false,
      modelName: "qwen3-14b-4test",
      externalKB: false,
      cTime: getSystemTime(),
    },
    responseChatItemId: getNanoid(24),
    appId: "68832e9ca151189bcce3af66",
    chatId: chatId,
    detail: true,
    stream: true,
  }

  try {
    const response = await fetch(
      "https://agent-dev.cube.lenovo.com/api/v1/chat/completions",

      {
        headers: {
          accept: "text/event-stream",
          "accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
          "cache-control": "no-cache",
          "content-type": "application/json",
          pragma: "no-cache",
          "sec-ch-ua":
            '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          cookie:
            "NEXT_LOCALE=zh-CN; NEXT_DEVICE_SIZE=pc; ARK_ID=JS2d76f55a1334555fbcd39d12b9479ab92d76; FZ_STROAGE.lenovo.com=eyJTRUVTSU9OSUQiOiIxMDY2MjQ4NjcxOGVlOGM5IiwiU0VFU0lPTkRBVEUiOjE3NTI4MjE3NDc0MTIsIkFSS19JRCI6IkpTMmQ3NmY1NWExMzM0NTU1ZmJjZDM5ZDEyYjk0NzlhYjkyZDc2In0%3D; captcha=ekkMYs; fastgpt_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODJlZTY5OWU0ODViZDllYjRkYjBhMTMiLCJ0ZWFtSWQiOiI2NjhlNTYwYjQ5YzVhNWQxZmE2NDNhZjUiLCJ0bWJJZCI6IjY4MmVlNjk5ZTQ4NWJkOWViNGRiMGExOSIsImlzUm9vdCI6dHJ1ZSwiY2F0ZWdvcnkiOiJhZG1pbiIsImFwcGxpY2F0aW9uIjoiNjgwZjQ4NjEyZjEzMTJjZGU0NTFkM2ExIiwiZXhwIjoxNzYxMDM0MTgwLCJpYXQiOjE3NTMyNTgxODB9.eWJGQ35gPLObCnEsg_sf2rKGy36f_HHRnFm4jk9H0Yw",
        },
        referrer:
          "https://agent-dev.cube.lenovo.com/chat?appId=66c2a46ea90a341aaf6e51ee",
        body: JSON.stringify(params),
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    )

    // 处理流式响应直到完成
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      //   console.log(value)
      if (done) break
      // 可选：处理接收到的流数据
      //   console.log(decoder.decode(value))
    }
    console.log(`请求 ${requestNumber} 完成`)
  } catch (error) {
    console.error(`请求 ${requestNumber} 失败:`, error)
  }
}

// 循环发起请求（无限循环，按Ctrl+C终止）
async function startLoop() {
  let requestNumber = 1
  while (true) {
    // 生成40个独立chatId
    const chatIds = Array.from({ length: 100 }, () => getNanoid(24))

    // 将40个chatId分成4组，每组10个并行处理
    const batchSize = 10
    for (let batch = 0; batch < 10; batch++) {
      const startIndex = batch * batchSize
      const endIndex = startIndex + batchSize
      const batchChatIds = chatIds.slice(startIndex, endIndex)

      // 并行处理当前批次的10个chatId
      await Promise.all(
        batchChatIds.map(async (chatId) => {
          // 每个chatId使用10次
          for (let i = 0; i < 10; i++) {
            await fetchWithRetry(requestNumber++, chatId)
          }
        })
      )
    }

    // 添加1秒间隔避免请求过于频繁
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}

startLoop()
