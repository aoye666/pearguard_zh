# PearGuard 汉化方案

## 一、现状分析

项目目前**完全硬编码英文**，没有任何 i18n 框架或翻译文件。所有用户可见字符串直接写在 JSX 和 JS 文件中。

### 需要汉化的文件范围

| 层级 | 文件数 | 字符串数量（估算） |
|------|--------|---------------------|
| WebView UI 组件 (`src/ui/components/`) | ~20 个 | ~300+ |
| RN 原生壳 (`app/`) | 2 个 | ~30 |
| Bare 工作线程 (`src/`) | 3 个 | ~20 |
| Android 原生代码 (`android/`) | 2+ 个 | ~15 |
| **总计** | **~27 个文件** | **~365+ 字符串** |

---

## 二、按模块分类的字符串清单

### 2.1 家长端 UI 组件

#### Dashboard (`src/ui/components/Dashboard.jsx`)
- "No children paired yet" — 空状态
- "Add a child device to get started" — 空状态引导
- "Pair a Device" — 按钮
- "Lock Device" — 锁定设备按钮
- "Grant Time" — 授予时间按钮
- "Pause" — 暂停保护按钮
- "Unlock Device" — 解锁设备按钮
- formatTime 中的时间单位：`h`, `m`, `s`

#### ChildDetail (`src/ui/components/ChildDetail.jsx`)
- Tab 标签：`Usage`, `Apps`, `Activity`, `Rules`, `Advanced`
- "Lock Device" / "Unlock Device" — 锁定/解锁按钮
- "Grant Time" — 授予时间按钮
- "Pause" / "Resume" — 暂停/恢复按钮
- "Lock Message" — 锁定消息输入框
- "Cancel" / "Lock" — 确认锁定弹窗

#### ChildCard (`src/ui/components/ChildCard.jsx`)
- 状态标签：`Online`, `Offline`, `Locked`
- "No activity yet" — 无活动
- 时间格式：`h`, `m`, `s`
- 子标题：`Screen time today`, `Current app`

#### AppsTab (`src/ui/components/AppsTab.jsx`)
- 搜索框 placeholder：`Search apps...`
- 状态标签：`Blocked`, `Allowed`, `Limit`
- 分类标签：`All`, `Blocked`, `Allowed`, `Limited`, `Pending`
- "No apps found" / "No apps configured yet"
- "Limit (min)" — 时间限制输入
- "Approve" / "Deny" — 审批按钮
- "No limit set" / "No policy configured"
- "Revert to category limit" — 恢复为分类限制
- 时间显示：`h`, `m`, `min`
- 窗口摘要：`Blocked`, `Allowed only`
- "New app installed" / "App uninstalled" — 待审批标签

#### RulesTab (`src/ui/components/RulesTab.jsx`)
- 星期标签：`Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`
- 分类标签（来自 appCategories.js）
- "Screen time budget" — 屏幕时间预算
- "Daily limit" — 每日限制
- "Bedtime" — 就寝时间
- "Add schedule" — 添加计划
- "No schedules" — 无计划
- `hours`, `minutes`, `h`, `m`, `min`
- "Select all" / "Clear" — 全选/清除
- "Screen time exempt apps" — 屏幕时间豁免应用
- "Category limits" — 分类限制
- "Save Rules" — 保存规则
- "Rules saved and synced to child." — 保存成功
- "No changes to save." — 无更改
- "Save failed." — 保存失败

#### ActivityTab (`src/ui/components/ActivityTab.jsx`)
- 类型标签：`Bypass Attempt`, `Protection Off`, `PIN Used`, `Time Request`, `App Installed`, `App Uninstalled`, `PIN Override`, `PIN Guessing`, `New App`, `App Request`
- "No activity yet" — 空状态
- "Approve" / "Deny" — 审批按钮
- 时间格式：`h`, `m`, `s`
- "General screen time" — 通用屏幕时间
- "Extra time for" — 额外时间申请
- "Requested" / "Approved" / "Denied" — 请求状态

#### UsageTab (`src/ui/components/UsageTab.jsx`)
- "Today" / "Yesterday" — 日期标签
- 时间格式：`h`, `m`, `s`, `min`
- "No usage data yet" — 空状态
- "Screen time" — 屏幕时间
- "Current app" — 当前应用
- "Top apps" — 常用应用
- "Daily summary" — 每日摘要
- "Usage Reports" — 用量报告按钮

#### UsageReports (`src/ui/components/UsageReports.jsx`)
- 视图标签：`Daily`, `Trends`, `App Activity`, `Categories`
- "Today" / "Yesterday" — 日期标签
- "No data" / "No usage data for this day"
- 时间格式：`h`, `m`, `s`
- "Total screen time" / "App breakdown" / "Hourly breakdown"
- "Back" — 返回按钮
- "Export" — 导出按钮

#### Settings (`src/ui/components/Settings.jsx`)
- "Settings" — 标题
- "Profile" — 个人资料折叠
- "Parent Name" — 名称标签
- placeholder: `e.g. Mom`
- "Photo" / "Remove" — 头像按钮
- "Saving..." / "Saved." / "Failed to save name."
- "Override PIN" — PIN 折叠
- "Children enter this PIN..." — 说明文字
- "Current PIN:" — 当前 PIN
- "Show" / "Hide" — 显示/隐藏 PIN
- "New PIN (4 to 10 digits)" / "Confirm PIN"
- placeholder: `e.g. 1234` / `Repeat PIN`
- "PIN updated successfully."
- "Save PIN"
- "Appearance" — 外观折叠
- "Dark mode" / "Light mode"
- "Time Request Options" — 时间请求选项
- "Choose which duration options..."
- `min`, `h`, `hour`, `hours`
- "Warning Thresholds"
- "The child will be notified..."
- "Device Backup" — 设备备份
- "Save your full parent state..."
- "Export backup"
- "Storage" — 存储折叠
- "The local database grows over time..."
- "Storage Breakdown" / "Analyze Reclaimable" / "Reclaim Storage"
- "Working..."
- "Reclaim Storage?" — 确认弹窗
- "This permanently deletes..."
- "Cancel" / "Reclaim now"
- "Save Settings" / "Settings saved and synced to child."

#### Profile (`src/ui/components/Profile.jsx`)
- "Profile" — 标题
- "Parent Name" / "Your Name" — 标签（按模式）
- placeholder: `e.g. Mom` / `e.g. Alex`
- "Photo" / "Remove" — 头像按钮
- "Saving..." / "Saved." / "Failed to save name."
- "Parent Device" — 默认父设备名
- "Connected" / "Offline" — 在线状态
- "Pair to Parent" / "Pair Another Parent" — 配对按钮
- "Scan QR Code" / "Show QR Code" / "Share Link" / "Paste Link"
- "Generating..." / "Cancel"
- placeholder: `pear://pearguard/join?...`
- "Pair" / "Connecting to parent..." / "Pairing in progress..."
- "Try Again"
- "Successfully paired with parent!"
- "Already paired with this parent."

#### InviteCard (`src/ui/components/InviteCard.jsx`)
- "Add a Child Device" — 标题
- "Scan QR Code" / "Show QR Code" / "Share Link" / "Paste Link"
- "Generating..." / "Cancel"
- "Scan Child's QR Code"
- "Ask your child to open PearGuard..."
- "Opening camera..." / "Connecting to child..."
- "Try Again" / "Back" / "Dismiss"
- "Paste Invite Link"
- placeholder: `pear://pearguard/join?...`
- "Pair"
- "Scan this QR code on the child's device."
- "Waiting for child to connect..."
- "Failed to generate invite. Please try again."
- "Timed out waiting for the child to connect..."

#### ChildInviteCard (`src/ui/components/ChildInviteCard.jsx`)
- "Show My QR Code" / "Share Link" — 按钮
- "Waiting for parent to connect..."
- "Share this link with your parent"

#### GrantTimeModal (`src/ui/components/GrantTimeModal.jsx`)
- "Grant bonus time to {name}?"
- "Bonus time granted"
- "Added {time} to {name}'s screen time for today."
- "Tops up today's screen-time budget..."
- "Done" / "Cancel"

#### PauseModal (`src/ui/components/PauseModal.jsx`)
- "Pause protection for {name}?"
- "{name} is on free time"
- "All limits, schedules and blocks are suspended until {time}."
- "Resume protection now"
- "Temporarily allow every app..."
- "1 hour" / "2 hours" / "4 hours" / "Rest of today"
- "Close"

#### AppWindowModal (`src/ui/components/AppWindowModal.jsx`)
- "Time window - {appName}"
- "Blocked during" / "Allowed only"
- "{app} is blocked except during this window."
- "{app} is blocked during this window."
- "From" / "to"
- "Pick at least one day." / "Set a start and end time." / "Start and end can't be the same."
- "Remove" / "Save"

#### PresetModal (`src/ui/components/PresetModal.jsx`)
- 预设名称相关
- "Save" / "Load" / "Delete"

#### RulesTransferModal (`src/ui/components/RulesTransferModal.jsx`)
- "Export rules" / "Import rules"
- "Export" / "Import" / "Cancel"

#### AdvancedTab (`src/ui/components/AdvancedTab.jsx`)
- "Export {name}'s rules to a JSON file..."
- "Export" / "Import"
- "Removing {name} unpairs this device..."
- "Unpair {name}"
- "Unpair from {name}?"
- "This will remove {name} from your dashboard..."
- "Cancel" / "Unpair"

#### DeviceBackupModal (`src/ui/components/DeviceBackupModal.jsx`)
- "Export Device Backup" / "Import Device Backup"
- "Working..."
- "Backup file saved ({bytes} bytes)."
- "Includes {n} paired child/children and {n} policy/policies."
- 安全警告文本
- "Exports your full parent state..."
- "Export Backup"
- "Choose a backup file to restore..."
- "Import Backup"
- "Cancel" / "Close"

#### AboutTab (`src/ui/components/AboutTab.jsx`)
- "PearGuard" / "Private. Peer-to-Peer. No Servers."
- 多段说明文字（How it works, Tutorial, Value, Bitcoin, Share, Contact）
- "Learn about P2P" / "Replay Tutorial" / "BTC" / "USD"
- "Bitcoin Crash Course" / "Share PearGuard" / "Send Email" / "Report Issue"
- "Copied" / "Copy"
- 捐赠相关文字（Lightning address, on-chain Bitcoin, wallet recommendations）
- "Close"

#### BatteryBanner (`src/ui/components/BatteryBanner.jsx`)
- "Keep PearGuard running"
- "To keep monitoring your child's device..."
- "1. Allow background activity"
- "2. Check your phone's extra settings"
- 各厂商说明（Samsung, Xiaomi, OnePlus, Huawei）
- "Allow background activity" / "Close"
- "Battery saver may stop monitoring"
- "Allow PearGuard to run in the background..."
- "Fix" / "Dismiss"

#### Tour (`src/ui/components/Tour.jsx`)
- 引导步骤的所有文字

#### ChildHome (`src/ui/components/ChildHome.jsx`)
- "Hi, {name}" / "Good morning" / "Good afternoon" / "Good evening"
- "No pending requests."
- 时间格式：`h`, `m`, `min`
- 状态标签：`Blocked`, `Allowed`, `No limit`

#### ChildRequests (`src/ui/components/ChildRequests.jsx`)
- "No pending requests"
- "Requested" / "Approved" / "Denied"
- 时间格式：`h`, `m`, `min`

#### LockOverlay (`src/ui/components/LockOverlay.jsx`)
- 设备锁定覆盖层文字

#### AvatarPicker (`src/ui/components/AvatarPicker.jsx`)
- "Take Photo" / "Choose from Gallery" / "Cancel"
- "Camera" / "Gallery"

#### TabBar (`src/ui/components/TabBar.jsx`)
- Tab 标签由父组件传入，本身无硬编码文字

### 2.2 儿童端 UI 组件

#### ChildApp (`src/ui/components/ChildApp.jsx`)
- Tab 标签：`Home`, `Requests`, `Profile`
- 其他儿童端独有 UI 文字

### 2.3 React Native 壳 (`app/`)

#### setup.tsx
- "Welcome to PearGuard"
- "How will you use this device?"
- "I'm a Parent" / "Monitor and manage your child's device"
- "I'm a Child" / "This device will be monitored by a parent"
- "Restore parent from backup"
- "What's your name?"
- "This name is shown to the other device when you pair."
- placeholder: "Your name"
- "Continue"
- "Set Override PIN"
- "Children enter this PIN on the block screen..."
- "PIN (4 to 10 digits)"
- placeholder: "e.g. 1234"
- "Confirm PIN"
- placeholder: "Repeat PIN"
- "Save PIN"
- "Backup restored"
- "Your parent identity, paired children, and policies have been restored..."
- "App not ready — please wait"
- "No file selected."
- "Selected file is empty."
- "Failed to restore backup."
- "Name is required."

#### join.tsx
- "Connecting…"

#### index.tsx
- 通知相关文字（已通过 bypass-reasons.js 集中管理）
- "IPC timeout" — 内部错误
- "Camera permission denied. Please enable in Settings."

### 2.4 Bare 工作线程 (`src/`)

#### bypass-reasons.js（~20 条绕过原因描述）
- "{name}'s parental controls disabled"
- "{name} turned off the PearGuard Accessibility Service."
- "{name} removed PearGuard's device administrator."
- "PearGuard was stopped on {name}'s device"
- "{name} force-stopped PearGuard. App blocking is not running."
- "App blocking paused on {name}'s device"
- "PearGuard's protection service was stopped by the device..."
- "Device clock changed"
- "{name} changed the device clock..."
- "Device time zone changed"
- "{name} changed the device time zone..."
- "App blocking isn't working on {name}'s PC"
- 多条 Linux 相关说明
- "App blocking is off"
- "App blocking is not running on {name}'s device."

#### pin-rules.js
- "PIN must be 4 to 10 digits."
- "PIN must contain only digits."

#### bare.js (通知文本)
- "wants more time" — 时间请求通知
- "used PIN to open" — PIN 覆盖通知
- "is guessing the PIN" — PIN 猜测通知
- "New App Installed" / "installed" / "approve or deny?"
- "App Removed" / "uninstalled"
- "You installed" / "You uninstalled" (儿童侧通知)

### 2.5 Android 原生代码

主要在 `AppBlockerModule.java` 和 `UsageStatsModule.java` 的覆盖层和通知中：
- 阻止覆盖层 UI 文字
- 系统通知标题和正文
- 无障碍服务描述文字

---

## 三、推荐方案

### 方案：轻量级翻译字典（推荐）

由于项目是 WebView 内运行 React，不需要 `react-i18next` 等重型框架。建议：

1. **创建 `src/ui/locales/` 目录**，包含：
   - `zh-CN.js` — 简体中文翻译
   - `en.js` — 英文原文（作为 fallback 和 key 参考）
   - `index.js` — 简单的 `t(key, params)` 翻译函数

2. **翻译字典结构**：
```js
// src/ui/locales/zh-CN.js
export default {
  // 通用
  "Cancel": "取消",
  "Save": "保存",
  "Done": "完成",
  "Close": "关闭",
  "Back": "返回",
  "Remove": "移除",
  "Export": "导出",
  "Import": "导入",
  "Copy": "复制",
  "Copied": "已复制",
  "Loading...": "加载中...",
  "Working...": "处理中...",
  "Try Again": "重试",
  "Dismiss": "忽略",
  "Show": "显示",
  "Hide": "隐藏",
  "Search": "搜索",
  "No data": "暂无数据",

  // 仪表盘
  "Dashboard": "仪表盘",
  "No children paired yet": "尚未配对儿童设备",
  "Add a child device to get started": "添加儿童设备以开始使用",
  "Pair a Device": "配对设备",
  "Lock Device": "锁定设备",
  "Unlock Device": "解锁设备",
  "Grant Time": "授予时间",
  "Pause": "暂停保护",
  "Online": "在线",
  "Offline": "离线",
  "Locked": "已锁定",
  "Screen time today": "今日屏幕时间",
  "Current app": "当前应用",
  "No activity yet": "暂无活动",

  // 应用管理
  "Apps": "应用",
  "Blocked": "已阻止",
  "Allowed": "已允许",
  "Limit": "限制",
  "Pending": "待处理",
  "All": "全部",
  "Limited": "已限制",
  "Search apps...": "搜索应用...",
  "No apps found": "未找到应用",
  "No apps configured yet": "尚未配置应用",
  "Approve": "批准",
  "Deny": "拒绝",
  "No limit set": "未设置限制",
  "Revert to category limit": "恢复为分类限制",

  // 规则
  "Rules": "规则",
  "Screen time budget": "屏幕时间预算",
  "Daily limit": "每日限制",
  "Bedtime": "就寝时间",
  "Add schedule": "添加计划",
  "No schedules": "无计划",
  "Save Rules": "保存规则",
  "Rules saved and synced to child.": "规则已保存并同步到儿童设备。",
  "No changes to save.": "没有需要保存的更改。",
  "Save failed.": "保存失败。",
  "Select all": "全选",
  "Clear": "清除",
  "hours": "小时",
  "minutes": "分钟",

  // 活动
  "Activity": "活动",
  "Bypass Attempt": "绕过尝试",
  "Protection Off": "保护已关闭",
  "PIN Used": "已使用 PIN",
  "Time Request": "时间请求",
  "App Installed": "已安装应用",
  "App Uninstalled": "已卸载应用",
  "PIN Override": "PIN 覆盖",
  "PIN Guessing": "PIN 猜测",
  "New App": "新应用",
  "App Request": "应用请求",
  "No activity yet": "暂无活动",

  // 用量
  "Usage": "用量",
  "Today": "今天",
  "Yesterday": "昨天",
  "No usage data yet": "暂无使用数据",
  "Screen time": "屏幕时间",
  "Top apps": "常用应用",
  "Daily summary": "每日摘要",
  "Usage Reports": "使用报告",
  "Daily": "每日",
  "Trends": "趋势",
  "App Activity": "应用活动",
  "Categories": "分类",
  "Total screen time": "总屏幕时间",

  // 设置
  "Settings": "设置",
  "Profile": "个人资料",
  "Parent Name": "家长名称",
  "Your Name": "你的名称",
  "Photo": "照片",
  "Saving...": "保存中...",
  "Saved.": "已保存。",
  "Failed to save name.": "保存名称失败。",
  "Override PIN": "覆盖 PIN",
  "Current PIN:": "当前 PIN：",
  "New PIN (4 to 10 digits)": "新 PIN（4 到 10 位数字）",
  "Confirm PIN": "确认 PIN",
  "PIN updated successfully.": "PIN 更新成功。",
  "Save PIN": "保存 PIN",
  "Appearance": "外观",
  "Dark mode": "深色模式",
  "Light mode": "浅色模式",
  "Time Request Options": "时间请求选项",
  "Warning Thresholds": "提醒阈值",
  "Device Backup": "设备备份",
  "Export backup": "导出备份",
  "Storage": "存储",
  "Storage Breakdown": "存储明细",
  "Analyze Reclaimable": "分析可回收",
  "Reclaim Storage": "回收存储",
  "Reclaim Storage?": "回收存储？",
  "Reclaim now": "立即回收",
  "Save Settings": "保存设置",
  "Settings saved and synced to child.": "设置已保存并同步到儿童设备。",

  // 配对
  "Add a Child Device": "添加儿童设备",
  "Scan QR Code": "扫描二维码",
  "Show QR Code": "显示二维码",
  "Share Link": "分享链接",
  "Paste Link": "粘贴链接",
  "Pair to Parent": "配对家长",
  "Pair Another Parent": "配对另一个家长",
  "Pair": "配对",
  "Connecting to parent...": "正在连接家长...",
  "Connecting to child...": "正在连接儿童...",
  "Pairing in progress...": "配对进行中...",
  "Successfully paired with parent!": "已成功与家长配对！",
  "Already paired with this parent.": "已与此家长配对。",
  "Waiting for child to connect...": "等待儿童设备连接...",
  "Scan this QR code on the child's device.": "在儿童设备上扫描此二维码。",
  "Generating...": "生成中...",
  "Opening camera...": "正在打开相机...",
  "Parent Device": "家长设备",
  "Connected": "已连接",

  // 暂停/授予
  "Pause protection for {name}?": "暂停对 {name} 的保护？",
  "{name} is on free time": "{name} 正处于自由时间",
  "Resume protection now": "立即恢复保护",
  "1 hour": "1 小时",
  "2 hours": "2 小时",
  "4 hours": "4 小时",
  "Rest of today": "今天剩余时间",
  "Grant bonus time to {name}?": "向 {name} 授予额外时间？",
  "Bonus time granted": "额外时间已授予",
  "Added {time} to {name}'s screen time for today.": "已为 {name} 今天的屏幕时间增加 {time}。",

  // 时间窗口
  "Blocked during": "此期间阻止",
  "Allowed only": "仅此期间允许",
  "From": "从",
  "to": "至",
  "Remove": "移除",
  "Pick at least one day.": "请至少选择一天。",
  "Set a start and end time.": "请设置开始和结束时间。",
  "Start and end can't be the same.": "开始和结束时间不能相同。",

  // 关于
  "About": "关于",
  "Learn about P2P": "了解 P2P",
  "Replay Tutorial": "重播教程",
  "Share PearGuard": "分享 PearGuard",
  "Send Email": "发送邮件",
  "Report Issue": "报告问题",

  // 电池
  "Battery saver may stop monitoring": "省电模式可能会停止监控",
  "Fix": "修复",
  "Allow background activity": "允许后台活动",
  "Keep PearGuard running": "保持 PearGuard 运行",

  // 设置向导
  "Welcome to PearGuard": "欢迎使用 PearGuard",
  "I'm a Parent": "我是家长",
  "I'm a Child": "我是儿童",
  // ... 更多
};
```

3. **`t()` 函数**：
```js
// src/ui/locales/index.js
import zhCN from './zh-CN.js';
import en from './en.js';

const locales = { 'zh-CN': zhCN, en };
let currentLocale = 'en'; // 默认英文

export function setLocale(locale) {
  if (locales[locale]) currentLocale = locale;
}

export function t(key, params = {}) {
  const dict = locales[currentLocale] || locales.en;
  let text = dict[key] ?? key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}
```

4. **使用方式**：在组件中引入 `t` 函数，替换硬编码字符串：
```jsx
import { t } from '../locales/index.js';

// 之前
Button label="Cancel"

// 之后
Button label={t("Cancel")}
```

### 实施步骤

1. **Phase 1**：创建 `src/ui/locales/` 基础结构 + `t()` 函数
2. **Phase 2**：汉化通用组件（primitives: Button, Modal, Input 等——如果它们有硬编码文字）
3. **Phase 3**：汉化家长端核心页面（Dashboard → ChildDetail → AppsTab → RulesTab）
4. **Phase 4**：汉化家长端辅助页面（ActivityTab, UsageTab, UsageReports, Settings, Profile, AboutTab）
5. **Phase 5**：汉化模态框组件（GrantTime, Pause, AppWindow, Preset, RulesTransfer, DeviceBackup, InviteCard, ChildInviteCard）
6. **Phase 6**：汉化儿童端页面（ChildHome, ChildRequests, ChildApp）
7. **Phase 7**：汉化 RN 壳（app/setup.tsx, app/join.tsx）
8. **Phase 8**：汉化后端通知文字（bypass-reasons.js, pin-rules.js, bare.js）
9. **Phase 9**：汉化 Android 原生代码中的用户可见字符串
10. **Phase 10**：添加语言切换入口（Settings 中增加语言选择）

### 注意事项

- **不汉化的内容**：代码注释、日志输出、Git 提交信息、API 方法名、Hyperbee 键名
- **日期格式**：`toLocaleDateString('en-US', ...)` 需要改为 `'zh-CN'` 或使用 `Intl` API 自动适配
- **时间格式**：`h`, `m` 可保留或改为 `小时`/`分钟`（建议保留短格式，节省空间）
- **星期缩写**：`Sun/Mon/Tue...` 需要改为 `日/一/二...` 或 `周日/周一...`
- **Bypass Reasons**：这些字符串需要特别注意，因为部分涉及对儿童的指控措辞，翻译需准确传达严重程度
- **Android 原生代码**：`AppBlockerModule.java` 中的覆盖层文字和 `UsageStatsModule.java` 中的通知文字也需要翻译