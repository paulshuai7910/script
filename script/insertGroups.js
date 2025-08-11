const mongoose = require("mongoose")
import dotenv from "dotenv"

dotenv.config()

const usersGroupInfo = [
  {
    firstGroup: "AI混合云交付中心",
    subGroups: [
      "AI混合云交付中心",
      "技术创新中心",
      "AI智能体科室",
      "数据安全技术科室",
      "PS现场交付处",
      "IDC技术科室",
      "国产化技术科室",
      "技术赋能处",
      "MS AI服务台开发",
    ],
  },
  {
    firstGroup: "AI行业解决方案交付中心",
    subGroups: ["AI行业解决方案交付中心"],
  },
  {
    firstGroup: "others",
    subGroups: ["others"],
  },
  {
    firstGroup: "集成项目管理中心",
    subGroups: ["PMO", "集成项目管理中心"],
  },
  {
    firstGroup: "交付平台东北区域",
    subGroups: ["交付平台东北区域", "运维服务PM&SDM"],
  },
  {
    firstGroup: "交付平台东南区域",
    subGroups: ["交付平台东南区域", "运维服务PM&SDM"],
  },
  {
    firstGroup: "交付平台华北区域",
    subGroups: [
      "交付平台华北区域",
      "运维服务PM&SDM",
      "运维服务-工程师助手-MS爱慕项目",
    ],
  },
  {
    firstGroup: "交付平台华东区域",
    subGroups: [
      "交付平台华东区域",
      "运维服务PM&SDM",
      "运维服务-工程师助手-MS瑞表项目",
      "运维服务-工程师助手-MS达能项目",
      "运维服务-工程师助手-MS欧莱雅项目",
    ],
  },
  {
    firstGroup: "交付平台华南区域",
    subGroups: [
      "交付平台华南区域",
      "运维服务PM&SDM",
      "运维服务-工程师助手-MS美心项目",
      "运维服务-工程师助手-MS铂涛项目",
    ],
  },
  {
    firstGroup: "交付平台西北区域",
    subGroups: ["交付平台西北区域", "运维服务PM&SDM"],
  },
  {
    firstGroup: "交付平台西南区域",
    subGroups: ["交付平台西南区域", "运维服务PM&SDM"],
  },
  {
    firstGroup: "交付平台中东区域",
    subGroups: ["交付平台中东区域", "运维服务PM&SDM"],
  },
  {
    firstGroup: "交付资源池",
    subGroups: [
      "交付资源池",
      "备件供应链",
      "渠道交付管理",
      "手机备件供应链",
      "子公司资源管理",
    ],
  },
  {
    firstGroup: "客户体验部",
    subGroups: ["客户体验部"],
  },
  {
    firstGroup: "渠道",
    subGroups: [
      "渠道",
      "渠道北区",
      "渠道东区",
      "渠道管理部",
      "渠道南区",
      "渠道西区",
      "渠道技术主管",
      "渠道备管-南区",
      "渠道备管-北区",
    ],
  },
  {
    firstGroup: "现场交付部",
    subGroups: ["北区SSR", "东区SSR", "西区SSR", "现场交付部", "南区SSR"],
  },
  {
    firstGroup: "想帮帮",
    subGroups: ["想帮帮"],
  },
  {
    firstGroup: "远程技术支持中心",
    subGroups: [
      "JV组",
      "ISG-WX",
      "ISG-L1.5组",
      "ISG-L2组",
      "ISG-HF",
      "ISG-KT",
      "IDG-KT组",
      "IDG-L2组",
      "IDG-TJ组",
      "IDG-HF组",
      "IDG-WX组",
      "远程技术支持中心",
    ],
  },
  {
    firstGroup: "运营管理部",
    subGroups: ["运营管理部"],
  },
  {
    firstGroup: "支持&管理服务交付中心",
    subGroups: [
      "运维服务PMO",
      "支持&管理服务交付中心",
      "nutanix软件运维",
      "DaaS交付管理处",
      "DaaS",
      "T2项目管理办公室",
      "Truscale项目管理部",
      "方案远程运维服务处",
      "资源供给&效率管理",
      "硬件服务交付",
    ],
  },
  {
    firstGroup: "智能化服务准备部",
    subGroups: ["Readiness", "服务流程变革处", "智能化服务准备部"],
  },
  {
    firstGroup: "资质建设部",
    subGroups: ["资质建设部"],
  },
]

// 直接在本文件定义schema和model
const userGroupSchema = new mongoose.Schema(
  {
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
  { collection: "user_groups" }
)

userGroupSchema.index({ firstGroup: 1 }, { unique: true })
const UserGroupModel = mongoose.model("user_groups", userGroupSchema)

async function main() {
  const MONGO_URI = process.env.MONGODB_URI
  await mongoose.connect(MONGO_URI)
  console.log("数据库连接成功")

  // 批量插入用户组
  try {
    const result = await UserGroupModel.insertMany(usersGroupInfo, {
      ordered: false,
    })
    console.log(`成功插入 ${result.length} 条用户组数据`)
  } catch (err) {
    if (err.writeErrors) {
      console.log(`部分插入成功，${err.writeErrors.length} 条重复或失败`)
    } else {
      console.error("插入失败:", err)
    }
  }
  process.exit(0)
}

main().catch((err) => {
  console.error("脚本执行出错:", err)
  process.exit(1)
})
