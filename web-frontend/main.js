document.addEventListener("DOMContentLoaded", () => {
  const messagesContainer = document.getElementById("messages");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");

  let userId = prompt("请输入你的用户ID（例如：张三）");
  if (!userId) {
    userId = "匿名用户" + Math.floor(Math.random() * 1000);
  }

  function initializeChat(currentUserId) {
    // 动态获取当前页面的主机名，适配 localhost 和 局域网 IP
    const wsUrl = `ws://${window.location.hostname}:8000`;
    console.log(`[Client] 尝试连接到 WebSocket 服务器: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("[Client] WebSocket 连接已打开 (onopen)");
      messageInput.disabled = false;
      sendButton.disabled = false;
      messageInput.placeholder = "输入消息...";
      addMessage("系统", "你已成功连接，可以开始聊天了！", "system");

      // --- Hybrid 功能测试 ---
      if (window.AndroidNative) {
        try {
          const deviceInfo = window.AndroidNative.getDeviceInfo();
          addMessage("系统", `检测到 Android 设备: ${deviceInfo}`, "system");
          window.AndroidNative.showToast("Hybrid Chat 连接成功！");
        } catch (e) {
          console.error("调用 Android 接口失败", e);
        }
      }
    };

    ws.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        const type = messageData.user === currentUserId ? "own" : "other";
        addMessage(messageData.user, messageData.text, type);
      } catch (error) {
        console.error("无法解析收到的消息:", event.data);
      }
    };

    ws.onclose = (event) => {
      console.log(
        `[Client] 与WebSocket服务器的连接已断开 (onclose). Code: ${event.code}, Reason: ${event.reason}`
      );
      // 连接断开，禁用输入
      messageInput.disabled = true;
      sendButton.disabled = true;
      messageInput.placeholder = "连接已断开";
      addMessage("系统", "连接已断开。", "system");
    };

    ws.onerror = (error) => {
      console.error("WebSocket 错误:", error);
      messageInput.disabled = true;
      sendButton.disabled = true;
      messageInput.placeholder = "连接错误";
      addMessage("系统", "连接出现错误。", "system");
    };

    function sendMessage() {
      const messageText = messageInput.value.trim();
      if (messageText === "") return;

      const messageData = {
        user: currentUserId,
        text: messageText,
      };

      // 发送消息
      ws.send(JSON.stringify(messageData));

      messageInput.value = "";
      messageInput.focus();
    }

    sendButton.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        sendMessage();
      }
    });
  }

  function addMessage(user, text, type) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", type);

    const authorElement = document.createElement("div");
    authorElement.classList.add("author");
    authorElement.textContent = user;

    const textElement = document.createElement("div");
    textElement.classList.add("text");
    textElement.textContent = text;

    if (type !== "system") {
      messageElement.appendChild(authorElement);
    }
    messageElement.appendChild(textElement);

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  initializeChat(userId);
});
