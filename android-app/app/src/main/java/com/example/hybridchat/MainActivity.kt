package com.example.hybridchat

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val myWebView: WebView = findViewById(R.id.webview)
        
        // 1. 启用 JavaScript
        myWebView.settings.javaScriptEnabled = true
        
        // 2. 注入 JS Bridge，前端可以通过 window.AndroidNative 访问
        myWebView.addJavascriptInterface(WebAppInterface(this), "AndroidNative")

        // 3. 确保在 WebView 中打开链接，而不是跳转浏览器
        myWebView.webViewClient = object : WebViewClient() {
            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                super.onReceivedError(view, errorCode, description, failingUrl)
                // 在网页加载失败时显示错误信息
                android.widget.Toast.makeText(this@MainActivity, "Error: $description", android.widget.Toast.LENGTH_LONG).show()
            }
        }

        // 4. 加载 Web 页面
        // 注意：Android 模拟器访问本机 localhost 需使用 10.0.2.2
        // 如果是真机调试，请将此处改为你电脑的局域网 IP (例如 http://192.168.1.x:3000)
        // 尝试使用局域网 IP 替代 10.0.2.2，以避开模拟器代理问题
        myWebView.loadUrl("http://172.22.160.111:3000")
    }
}
