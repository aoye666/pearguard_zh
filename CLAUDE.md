# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

PearGuard 是一款隐私优先、点对点的家长控制应用。家长设备可以直接管理儿童设备的屏幕时间和应用访问——无需账号、无需服务器、无需订阅。儿童设备运行 Android 或 Windows；家长设备运行 Android 或 iOS。

身份体系基于设备本地生成的 Ed25519 加密密钥对。所有数据同步通过 Hyperswarm（基于 DHT 的 P2P 网络）进行，消息经过加密签名。策略在儿童设备上通过 Android 无障碍服务 + 设备管理员 API 执行，Windows 上通过用户空间监控执行。

## 构建与部署

两台通过 ADB 连接的测试设备：
- 设备 1：（家长设备 — 请替换为你的 ADB 序列号）
- 设备 2：（儿童设备 — 请替换为你的 ADB 序列号）

务必使用 `adb install -r` — **切勿卸载**（会保留 Hyperbee 数据）。

**仅修改 UI**（`src/ui/`）：
```bash
npm run build:ui
cd android && ./gradlew assembleDebug && cd ..
adb install -r /home/tim/peerloomllc/pearguard/android/app/build/outputs/apk/debug/app-debug.apk
```

**修改 bare.js**（之后也需要重新构建 UI）：
```bash
npm run build:bare
npm run build:ui
cd android && ./gradlew assembleDebug && cd ..
adb install -r /home/tim/peerloomllc/pearguard/android/app/build/outputs/apk/debug/app-debug.apk
```

**修改原生代码**（Java/Kotlin）：
```bash
cd android && ./gradlew assembleDebug && cd ..
adb install -r /home/tim/peerloomllc/pearguard/android/app/build/outputs/apk/debug/app-debug.apk
```

### iOS 构建（仅家长端）

**仅修改 UI**（`src/ui/`）：
```bash
npm run build:ui
cd ios && xcodebuild -workspace PearGuard.xcworkspace -scheme PearGuard -sdk iphoneos -configuration Debug build && cd ..
```

**修改 bare.js** 需要同时重新构建 Android 和 iOS bare 包：
```bash
npm run build:bare          # Android
npm run build:bare:ios      # iOS 真机
npm run build:bare:ios-sim  # iOS 模拟器
npm run build:ui
```

## 架构

### 三层运行时

```
┌──────────────────────────────────────────────────┐
│  React Native (Expo) 壳  —  app/index.tsx        │
│  - 加载 bundle，持有原生桥接                      │
│  - 路由所有层之间的 IPC                           │
│  - 处理深度链接、通知、相机                       │
│  - 管理 Bare Worklet 生命周期                    │
├──────────────────────────────────────────────────┤
│  WebView (React UI)  —  src/ui/                  │
│  - 家长模式：仪表盘、策略管理                     │
│  - 儿童模式：状态页、时间请求                     │
│  - 通过 postMessage ↔ RN 通信                    │
│  - 在全屏 WebView 中渲染                         │
├──────────────────────────────────────────────────┤
│  Bare Worklet (P2P 后端)  —  src/bare.js         │
│  - Ed25519 密钥对身份，签名/验证                  │
│  - Hyperswarm 节点发现与连接                      │
│  - Hyperbee 本地持久化（追加日志）                │
│  - 所有同步协议逻辑（策略、用量等）               │
│  - 运行在原生线程上，JS 线程挂起后仍存活          │
└──────────────────────────────────────────────────┘
```

第四层在 Android 儿童设备上独立运行：
```
┌──────────────────────────────────────────────────┐
│  Android 原生执行层                               │
│  - 无障碍服务（AppBlockerModule）                 │
│  - 设备管理员（DeviceAdminModule）                │
│  - UsageStatsModule（UsageStatsManager 查询）    │
│  - EnforcementService（后台看门狗）               │
│  - ParentConnectionService（家长端保活）          │
│  - PackageMonitorModule（应用安装/卸载监听）      │
└──────────────────────────────────────────────────┘
```

### IPC 消息流

所有跨层调用均为换行分隔的 JSON，按 `method` 名称路由：

- **WebView → RN**：`window.ReactNativeWebView.postMessage(JSON.stringify({ id, method, args }))`
- **RN → Bare 工作线程**：`_worklet.IPC.write(b4a.from(JSON.stringify(msg) + '\n'))`
- **Bare → RN**：`BareKit.IPC.write(Buffer.from(JSON.stringify(msg) + '\n'))`
- **RN → WebView**：`webViewRef.current.injectJavaScript('window.__pearResponse(...); true;')`
- **RN → WebView（事件）**：`webViewRef.current.injectJavaScript('window.__pearEvent("name", data); true;')`

**Bare↔RN 通道的消息类型：**
- `{ type: 'response', id, result, error }` — 回复之前的请求（id 与请求 id 匹配）
- `{ type: 'event', event: '...', data: {...} }` — 异步推送事件（节点连接、用量报告等）
- `{ method: 'native:...', args: {...} }` — Bare 指示 RN 调用原生模块（setPolicy、grantOverride、showNotification）

**请求/响应流程：**
1. WebView 调用 `window.callBare(method, args)` → 返回 Promise
2. RN 收到消息，分配一个 `bareId`，转发给工作线程
3. 工作线程按方法名分发，返回 `{ type: 'response', id: bareId, result }`
4. RN 通过 `window.__pearResponse(msg.id, result, error)` 解决 WebView 的原始 Promise

**事件流（Bare → WebView）：**
1. Bare 发送 `{ type: 'event', event: '...', data: {...} }`
2. RN 将事件记录到 `ReplayBuffer`（有界，按 seq 编号）
3. RN 向 WebView 注入 `window.__pearEvent(name, data, seq)`
4. WebView（重新）加载时，完整回放缓冲区中的所有事件
5. WebView 丢弃 `seq ≤ 已见最大seq` 的事件（幂等）

**RN 本地处理的方法**（不转发给 Bare）：
`navigateTo`、`haptic:tap`、`battery:status`、`battery:request`、`clipboard:copy`、`clipboard:read`、`file:save`、`file:pick`、`share:text`、`canOpenURL`、`openURL`、`qr:scan`、`avatar:pickPhoto`、`back:result`

### Bare 工作线程启动序列

```
1. RN 加载 bare-universal.bundle，创建 Worklet，调用 start()
2. bare.js 运行 → 发送 'bareReady' 事件
3. RN 发送 { method: 'init', dataDir, debug }
4. bare.js 打开 Hypercore + Hyperbee，加载/生成身份，加载模式
5. bare.js 重新加入已持久化的 Hyperswarm 主题
6. bare.js 发送 'ready' 事件，携带 { publicKey, mode, pairedKeys }
7. RN 设置 dbReady=true，WebView 渲染
```

握手看门狗（8 秒超时，最多 2 次重生）可恢复静默失败的工作线程启动。

### 关键源文件

| 文件 | 作用 |
|------|------|
| `app/index.tsx` | RN 壳：加载 bundle，启动工作线程，管理所有 IPC 路由 |
| `app/setup.tsx` | 首次启动模式选择，PIN 设置，备份恢复 |
| `app/join.tsx` | 处理 `pear://pearguard/join/...` 深度链接邀请 URL |
| `src/bare.js` | Bare 工作线程入口：Hyperswarm、签名、Hyperbee、所有数据逻辑 |
| `src/bare-dispatch.js` | 纯方法分发表（可在 Node/jest 中测试，与 IPC 接线分离） |
| `src/identity.js` | Ed25519 密钥对生成和签名/验证辅助函数（sodium-native） |
| `src/invite.js` | 邀请链接构建/解析器（在 Bare 和 RN 中均可运行） |
| `src/message.js` | 签名的 P2P 消息辅助函数（signMessage、verifyMessage） |
| `src/policy.js` | 策略执行逻辑：时间表检查、限制、屏幕时间上限、暂停 |
| `src/pin-rules.js` | PIN 验证规则 |
| `src/bypass-reasons.js` | 将绕过原因码映射为面向家长的标签（区分篡改与自身限制） |
| `src/log.js` | 条件日志（初始化时由 debug 控制开关，warn/error 始终开启） |
| `src/line-decoder.js` | 二进制块→完整行解码器（防止多字节 UTF-8 字符被截断） |
| `src/webview-replay.js` | 有界 seq 编号回放缓冲区，用于 Bare→WebView 事件 |
| `src/rn-theme.js` | 共享 RN 主题常量（颜色、间距、排版） |
| `src/ui/main.jsx` | WebView 引导：设置 IPC 桥接全局变量（`__pearResponse`、`__pearEvent`、`callBare` 等），挂载 React |
| `src/ui/App.jsx` | 根 React 组件：查询模式，渲染 ParentApp 或 ChildApp |
| `src/ui/components/ParentApp.jsx` | 家长仪表盘壳：标签栏、儿童卡片、导航 |
| `src/ui/components/ChildApp.jsx` | 儿童应用壳：状态、请求、设置 |
| `src/ui/components/Dashboard.jsx` | 家长主仪表盘：儿童卡片、活动概览 |
| `android/.../UsageStatsModule.java` | 核心原生模块：用量统计、策略存储、通知、权限 |
| `android/.../AppBlockerModule.java` | 无障碍服务：执行应用阻止、覆盖层、时间限制 |
| `android/.../EnforcementService.java` | 后台服务：保持执行存活性，检测绕过 |
| `android/.../ParentConnectionService.java` | 前台服务：在家长设备上保持 Hyperswarm 连接 |

### Hyperbee 数据键

| 键模式 | 值 | 说明 |
|-------------|-------|-------|
| `identity` | `{ publicKey: hex, secretKey: hex, createdAt }` | 设备身份 |
| `mode` | `'parent'` 或 `'child'` | 首次启动设置时设定 |
| `profile` | `{ displayName, avatar }` | 用户可见的个人资料 |
| `pin` | `{ pinHash }` | 家长的覆盖 PIN（哈希存储） |
| `peers:{publicKey}` | `{ publicKey, displayName, pairedAt, swarmTopic }` | 已配对节点记录 |
| `topics:{topicHex}` | `{ topicHex, joinedAt }` | 持久化的 swarm 主题，用于重新加入 |
| `policy:{childPublicKey}` | 完整策略对象（家长侧） | 发送给儿童的最新策略 |
| `policy` | 完整策略对象（儿童侧） | 最新收到的策略 |
| `sessions:{childPK}:{date}:{ts}` | 会话对象数组 | 每日使用会话 |
| `usage:{childPK}:{ts}` | 用量报告数据 | 原始用量数据点 |
| `dailyTotals:{childPK}:{date}` | `{ date, apps, updatedAt }` | 聚合的每日总计（30 天窗口） |
| `alert:{childPK}:{ts}` | 绕过告警对象 | 保留 7 天 |
| `request:{id}` | 时间请求对象 | 儿童的额外时间请求 |
| `req:{id}` | 请求解决记录 | 保留 7 天 |
| `override:{childPK}:{pkg}` | 覆盖授权 | 有效期至 expiresAt |
| `screenTimeBonus` | `{ date, seconds, updatedAt }` | 家长授予的额外屏幕时间（儿童侧） |
| `usageExclusions:{childPK}` | `{ packages: { [pkg]: true } }` | 每个儿童被家长隐藏的应用包 |

### P2P 协议消息类型

通过 Hyperswarm 连接发送的消息（均使用 `signMessage` 签名）：

| 类型 | 方向 | 用途 |
|------|-----------|---------|
| `hello` | 儿童 → 家长 | 配对握手：发送身份密钥、显示名称、头像 |
| `policy:update` | 家长 → 儿童 | 推送更新后的策略；儿童应用并转发给其他家长 |
| `usage:report` | 儿童 → 家长 | 定期用量数据（当前应用、屏幕时间、会话、每日总计） |
| `heartbeat` | 儿童 → 家长 | 60 秒保活心跳，携带当前应用和屏幕时间 |
| `time:request` | 儿童 → 家长 | 儿童为某个应用请求额外时间 |
| `time:extend` | 家长 → 儿童 | 家长授予每个应用的额外时间 |
| `time:extendGeneral` | 家长 → 儿童 | 家长授予通用屏幕时间奖励 |
| `request:denied` | 家长 → 儿童 | 家长拒绝额外时间请求 |
| `request:resolved` | 家长 → 家长 | 另一位家长已解决请求（家长间同步） |
| `requests:syncResolved` | 家长 → 儿童 | 家长请求已解决请求的状态（拉取同步） |
| `app:decision` | 家长 → 儿童 | 家长批准/拒绝新安装的应用 |
| `app:installed` | 儿童 → 家长 | 儿童安装了新应用（或家长转发） |
| `app:uninstalled` | 儿童 → 家长 | 儿童卸载了应用（或家长转发） |
| `apps:sync` | 儿童 → 家长 | 完整已安装应用列表（家长请求时） |
| `bypass:detected` | 儿童 → 家长 | 无障碍服务或设备管理员被禁用 |
| `pin:used` | 儿童 → 家长 | 儿童使用 PIN 覆盖打开了被阻止的应用 |
| `pin:failed` | 儿童 → 家长 | 儿童因多次猜错 PIN 被锁定 |

## 测试

```bash
npx jest                          # 运行所有测试
npx jest --selectProjects node    # 仅 Node 环境测试（src/ 逻辑）
npx jest --selectProjects jsdom   # 仅 jsdom 环境测试（UI 组件）
```

Jest 配置了两个项目：
- **node**（`tests/**/*.test.js`）：测试 bare-dispatch、identity、invite、message 签名、policy、pairing、backup、presets、bypass reasons、line decoder、webview replay
- **jsdom**（`src/ui/**/*.test.js`）：测试 React UI 组件

纯逻辑测试文件位于 `tests/` 目录，UI 测试文件与组件同目录。

## 分支策略

始终在开始工作前创建分支 — 切勿直接提交到 master。
- 功能分支：`feature/描述`
- Bug 修复分支：`bugfix/描述`
- 通过 GitHub PR 合并：`gh pr merge N --merge`
- 合并后：`git checkout master && git pull origin master`

## 关键设计模式

### Dispatch 分派模式
工作线程使用分发表（`bare-dispatch.js` 中的工厂函数）而非 switch 语句。`createDispatch(ctx)` 返回一个 `dispatch(method, args)` 函数。ctx 对象携带所有副作用依赖（db、swarm、peers、send、identity 等），使分派逻辑可在 Node.js 中无需 BareKit 即可测试。

### 顺序节点消息处理
在 `bare.js` 中，收到的节点消息通过 Promise 链（`msgChain = msgChain.then(...)`）处理，确保每条消息的数据库写入完成后才处理下一条消息。这防止了快速消息之间的竞态条件（例如排队的 time:request 后紧跟 request:resolved 回填）。

### 事件回放缓冲区
`ReplayBuffer`（位于 `webview-replay.js` 中）是一个有界、按 seq 编号的循环缓冲区。每个 Bare→WebView 事件都记录在此。每次 WebView 加载（包括崩溃后重载）时，整个缓冲区都会被回放。WebView 丢弃 `seq ≤ 已见最大seq` 的事件，使回放跨页面重载保持幂等。

### Hyperbee 存储回收
Hyperbee 是追加写入的——删除操作会留下墓碑。工作线程定期运行回收（每小时一次，当磁盘占用超过 75 MB 时触发），从头重建 Hypercore，压缩墓碑。每日清理扫描会修剪旧的 sessions、usage、alerts、requests 和过期的 overrides。