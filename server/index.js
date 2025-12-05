const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ noServer: true });

app.use(express.static(path.join(__dirname, "../web-frontend")));

server.on("upgrade", (request, socket, head) => {
  console.log(`[Server] 收到 Upgrade 请求: ${request.url}`);
  wss.handleUpgrade(request, socket, head, (ws) => {
    console.log("[Server] WebSocket 握手成功，触发 connection 事件");
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", (ws, req) => {
  console.log(`[Server] 一个客户端已连接 IP: ${req.socket.remoteAddress}`);

  ws.on("message", (message) => {
    console.log("收到消息: %s", message);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("一个客户端已断开连接");
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`服务器正在监听端口 ${PORT}`);
  console.log(`请在浏览器中打开 http://localhost:${PORT}`);
});
