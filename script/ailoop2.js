import { getSystemTime, getNanoid } from "./utils/index.js"
import { questions } from "./utils/index.js"

async function fetchWithRetry(requestNumber, chatId, question) {
  console.log(`发起请求次数: ${requestNumber}`)
  const params = {
    messages: [
      {
        dataId: getNanoid(24),
        hideInUI: false,
        role: "user",
        content: question, // 使用传入的问题
      },
    ],
    variables: {
      Readiness发文常识: "",
      modelName: "false",
      发文外知识: "",
      stuff_certificate: "",
      company_certificate: "",
      "n-1轮问题": "",
      "n-2轮问题": "",
      externalKB: false,
      useDS: false,
      cTime: getSystemTime(),
    },
    responseChatItemId: getNanoid(24),
    appId: "684fee9fabd59b6c2f5e0e65",
    chatId: chatId, // 使用传入的chatId
    detail: true,
    stream: true,
  }

  try {
    const response = await fetch(
      "https://agent-test.cube.lenovo.com/api/v1/chat/completions",

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
            "NEXT_LOCALE=zh-CN; ARK_ID=JS2d76f55a1334555fbcd39d12b9479ab92d76; FZ_STROAGE.lenovo.com=eyJTRUVTSU9OSUQiOiIxMDY2MjQ4NjcxOGVlOGM5IiwiU0VFU0lPTkRBVEUiOjE3NTI4MjE3NDc0MTIsIkFSS19JRCI6IkpTMmQ3NmY1NWExMzM0NTU1ZmJjZDM5ZDEyYjk0NzlhYjkyZDc2In0%3D; lang=zh_CN; isWechat=false; NEXT_DEVICE_SIZE=pc; captcha=9pLs6X; fastgpt_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjhlNTYwYjQ5YzVhNWQxZmE2NDNhZWMiLCJ0ZWFtSWQiOiI2NjhlNTYwYjQ5YzVhNWQxZmE2NDNhZjUiLCJ0bWJJZCI6IjY2OGU1NjBiNDljNWE1ZDFmYTY0M2FmYiIsImlzUm9vdCI6dHJ1ZSwiY2F0ZWdvcnkiOiJhZG1pbiIsImFwcGxpY2F0aW9uIjoiNjdiN2UzYWNlYjE5ZDQ4YmYxNTVjYTkxIiwiZXhwIjoxNzYyMzE0NTM0LCJpYXQiOjE3NTQ1Mzg1MzR9.bQG6hROVLRo3rsf1nwHIrnlyKWL0Jm6gsI4m0oA0qKU",
        },
        referrer: "https://agent-test.cube.lenovo.com/chat",
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
      if (done) break
    }
    console.log(`请求 ${requestNumber} 完成`)
  } catch (error) {
    console.error(`请求 ${requestNumber} 失败:`, error)
  }
}

// 重构后的循环函数 - 只循环questions一遍
async function startLoop() {
  let requestNumber = 1,
    chatIds = []

  // 生成所有请求的Promise数组
  const requests = questions.map((question, index) => {
    // 为每个请求生成新的chatId
    const chatId = getNanoid(24)
    chatIds.push(chatId)
    // 返回请求Promise，不等待完成
    return fetchWithRetry(requestNumber++, chatId, question)
  })

  // 并行执行所有请求
  await Promise.all(requests)

  console.log("所有问题请求已完成", chatIds)
}

startLoop()
