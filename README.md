# Lenovo AF DB Customer 数据导出脚本

这个脚本用于从 `lenovo_af_db_customer` 数据库中导出聊天机器人历史数据为 CSV 格式。

## 功能特性

- 自动连接 MySQL 数据库
- 导出前一天的数据
- 支持中文列名和数据
- 自动格式化时间和满意度评价
- 生成带时间戳的 CSV 文件

## 环境要求

- Node.js 16+
- MySQL 数据库访问权限

## 安装依赖

```bash
npm install
```

## 环境变量配置

在项目根目录创建 `.env` 文件，包含以下配置：

```env
MYSQL_HOST=172.101.10.21
MYSQL_USER=root
MYSQL_PASSWORD=PWD_yt.QRp)kW6hPQ
MYSQL_PORT=33306
MYSQL_DATABASE=lenovo_af_db_customer
```

## 使用方法

### 直接运行

```bash
cd script
node lenovo_af_db_customer.js
```

### 作为模块导入

```javascript
import {
  main,
  connectMySQL,
  getChatbotHistoryData,
} from "./script/lenovo_af_db_customer.js"

// 运行主函数
await main()

// 或者单独使用连接函数
const connection = await connectMySQL()
const data = await getChatbotHistoryData(connection)
```

## 输出数据说明

脚本会导出以下字段的 CSV 文件：

| 列名             | 说明             | 数据来源                                            |
| ---------------- | ---------------- | --------------------------------------------------- |
| 会话创建时间     | 会话创建的时间   | `chatbot_history.created_time`                      |
| 会话 ID          | 唯一的会话标识   | `chatbot_history.llm_session_id`                    |
| 客户名称         | 客户姓名         | `customer.crm_name`                                 |
| 会话详情         | 拼接的会话信息   | `chatbot_input` + `chatbot_output` + `satisfaction` |
| 是否转人工       | 是否转接人工客服 | 根据 `artificial_llm_id` 判断                       |
| 人工客服名称     | 人工客服姓名     | `chatbot_history_detail.engineer_name`              |
| 人工会话点评     | 客服评价等级     | `chatbot_history.valuation_level`                   |
| 人工会话差评反馈 | 差评反馈内容     | `chatbot_history.valuation_content`                 |

### 会话详情字段说明

会话详情字段将以下三个字段进行智能拼接：

- **输入内容**: `chatbot_history_detail.chatbot_input`
- **输出内容**: `chatbot_history_detail.chatbot_output`
- **满意度评价**: `chatbot_history_detail.satisfaction` (0-未评价，1-点赞，2-点踩)

拼接格式：`输入: {内容} | 输出: {内容} | 满意度: {评价}`

如果某个字段为空，则不会显示该部分，确保输出的可读性。

## 数据筛选条件

- 时间范围：当前日期前一天的数据
- 数据源：`chatbot_history` 表
- 关联表：`chatbot_history_detail` 和 `customer`

## 输出文件

- 位置：`output/` 目录
- 命名格式：`lenovo_af_db_customer_export_{timestamp}.csv`
- 编码：UTF-8

## 注意事项

1. 确保数据库连接信息正确
2. 确保有足够的数据库查询权限
3. 大量数据导出时可能需要较长时间
4. CSV 文件中的特殊字符会自动转义

## 错误处理

脚本包含完整的错误处理机制：

- 数据库连接失败
- 查询执行错误
- 文件写入错误
- 环境变量缺失

## 依赖包

- `mysql2`: MySQL 数据库驱动
- `dotenv`: 环境变量管理
- `fs`: 文件系统操作
- `path`: 路径处理

## 许可证

ISC
