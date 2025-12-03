# Hybrid Chat App 技术文档

## 1. 项目简介

本项目是一个 **混合开发 (Hybrid Development)** 的实时聊天应用演示。它展示了如何通过 Web 技术构建跨平台界面，并利用 Android 原生能力增强 Web 应用的功能。

项目包含三个核心部分：

1.  **Node.js 后端**：提供 WebSocket 服务和静态资源托管。
2.  **Web 前端**：基于 HTML/JS 的聊天界面，适配 PC 浏览器和移动端 WebView。
3.  **Android 原生壳**：使用 Kotlin 编写，通过 WebView 加载前端，并提供 JS Bridge (JS 与原生交互通道)。

## 2. 技术栈

- **后端**: Node.js, Express, ws (WebSocket 库)
- **前端**: HTML5, CSS3, Vanilla JavaScript (原生 JS)
- **移动端**: Android (Kotlin), WebView, Gradle
- **通信协议**: WebSocket (实时通信), JavascriptInterface (混合开发桥接)

## 3. 系统架构与功能实现

### 3.1 实时聊天功能 (WebSocket)

- **原理**: 前端通过 WebSocket 协议与 Node.js 服务器建立长连接。
- **流程**:
  1.  客户端发送消息 -> 服务器接收。
  2.  服务器遍历所有连接的客户端 -> 广播消息。
  3.  客户端收到消息 -> 更新 DOM 显示。
- **网络适配**:
  - 前端代码 (`main.js`) 动态获取 `window.location.hostname`，从而在 localhost 环境和局域网 IP 环境下都能正确连接 WebSocket。
  - 服务器监听 `0.0.0.0`，允许局域网内其他设备（如 Android 模拟器/真机）访问。

### 3.2 混合开发桥接 (JS Bridge)

Android 原生代码通过 `addJavascriptInterface` 向 WebView 注入一个名为 `AndroidNative` 的全局对象。前端 JS 可以直接调用该对象的方法。

- **已实现接口**:
  - `AndroidNative.showToast(String message)`: 调用 Android 原生的 Toast 提示框。
  - `AndroidNative.getDeviceInfo()`: 获取 Android 设备型号信息。
- **调用时机**:
  - 前端在 WebSocket 连接成功后，会自动检测是否存在 `window.AndroidNative` 对象。
  - 如果存在，则自动获取设备信息并显示在聊天窗口，同时弹出原生 Toast 提示“连接成功”。

## 4. 项目结构说明

```text
d:\byteDanceHomework\class3\
├── server/                 # 后端代码
│   └── index.js            # WebSocket 服务器入口，静态文件服务
├── web-frontend/           # 前端代码
│   ├── index.html          # 聊天主页
│   ├── style.css           # 样式表
│   └── main.js             # 聊天逻辑 & JS Bridge 调用
├── android-app/            # Android 工程
│   ├── app/src/main/java/com/example/hybridchat/
│   │   ├── MainActivity.kt     # 安卓主入口，配置 WebView
│   │   └── WebAppInterface.kt  # 定义暴露给 JS 的原生方法
│   ├── build.gradle        # 项目构建配置
│   └── ...
└── README.md               # 本文档
```

## 5. 关键代码解析

### 5.1 Android WebView 配置 (`MainActivity.kt`)

```kotlin
// 启用 JS 支持
myWebView.settings.javaScriptEnabled = true

// 注入 JS 对象，前端通过 window.AndroidNative 访问
myWebView.addJavascriptInterface(WebAppInterface(this), "AndroidNative")

// 错误处理：加载失败时弹出 Toast
myWebView.webViewClient = object : WebViewClient() {
    override fun onReceivedError(...) { ... }
}

// 加载局域网地址 (需根据实际 IP 修改)
myWebView.loadUrl("http://172.22.160.111:3000")
```

### 5.2 前端动态连接 (`main.js`)

```javascript
// 自动适配当前访问的主机名 (localhost 或 IP)
const wsUrl = `ws://${window.location.hostname}:3000`;
const ws = new WebSocket(wsUrl);

// 检测并调用原生能力
if (window.AndroidNative) {
  const info = window.AndroidNative.getDeviceInfo();
  window.AndroidNative.showToast("Hybrid Chat 连接成功！");
}
```

## 6. 使用与运行指南

### 6.1 环境准备

- Node.js (v14+)
- Android Studio (推荐最新版)
- JDK 17+ (用于 Android 构建)

### 6.2 启动后端

在项目根目录打开终端：

```bash
node server/index.js
```

_输出提示：服务器正在监听端口 3000_
