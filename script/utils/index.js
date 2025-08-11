import { customAlphabet } from "nanoid"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc.js"
import timezone from "dayjs/plugin/timezone.js"

dayjs.extend(utc)
dayjs.extend(timezone)

export const getNanoid = (size = 12) => {
  const firstChar = customAlphabet("abcdefghijklmnopqrstuvwxyz", 1)()

  if (size === 1) return firstChar

  const randomsStr = customAlphabet(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
    size - 1
  )()

  return `${firstChar}${randomsStr}`
}
export const getTimezoneOffset = (timeZone) => {
  const now = new Date()
  const tzString = now.toLocaleString("en-US", {
    timeZone,
  })
  const localString = now.toLocaleString("en-US")
  const diff = (Date.parse(localString) - Date.parse(tzString)) / 3600000
  const offset = diff + now.getTimezoneOffset() / 60
  return -offset
}
export const getSystemTime = () => {
  const timezoneDiff = getTimezoneOffset("Asia/Shanghai")
  const now = Date.now()
  const targetTime = now + timezoneDiff * 60 * 60 * 1000
  return dayjs(targetTime).format("YYYY-MM-DD HH:mm:ss dddd")
}
export const questions = [
  "什么是VMI模式？",
  "整体维保业务中，服务商结费是什么周期？",
  "中国购买的服务器到亚太地区享受服务的政策？",
  "服务器上架流程？",
  "Thinkpad笔记本意外保服务描述？",
  "备件合法性验证流程？",
  "拆机件的主机过保，但新主机在保，这种情况可以维保么？",
  "XC综合运维保障服务产品都包含哪些内容",
  "数据恢复报修？",
  "服务器闪修服务有时间限制么？",
  "过保的联想服务器可以做闪修服务么？",
  "意外保是否会对上门方式有规定或限制？",
  "若机器原带上门服务，购买意外保后，机器报修意外液体泼溅、跌落/碰撞、外力挤压、异常电流冲击这些问题，也是可以上门维修服务的吗？",
  "如果机器没有买意外保，只是有上门服务，如果发生故障，且可能为非损，这时候服务站上门检查故障是否属于上门服务范畴内？",
  "开天通用终端超长延保产品的“3升N”中，“N”代表什么？",
  "开天通用台式整机的LCD保修时长怎么查看？",
  "通用笔记本超长延保服务的备件支持策略是什么？",
  "开通通用产品的“90天重维率”目标值是多少？超出目标如何处理？",
  "大屏主机信息导入IPS流程中，物流遗漏主机编号时如何处理？",
  "突击小分队工程师如何处理未解决的维修单？",
  "工单类型“智慧大屏服务日-半人天”的结费依据是什么？",
  "工单类型“智慧互动大屏&智慧黑板检测及维修”的结费标准是什么？",
  "开天超长延保服务产是否支持后补销售？",
  "开天显示器在7-10年延保期内如何补充备件？",
  "宏杉存储现场服务支持7*24*4到场的城市列表",
  "整体维保商机应该找谁对接？",
  "ISG7*24*4的服务器产品支持城市有哪些？",
  "大客户锁定服务中的PC服务站锁定都包含哪些服务内容",
  "锁定服务KPI考核都包含哪些",
  "背靠背模式和VMI模式有什么区别",
]
