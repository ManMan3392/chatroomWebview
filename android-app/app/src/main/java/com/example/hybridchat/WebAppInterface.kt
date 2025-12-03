package com.example.hybridchat

import android.content.Context
import android.os.Build
import android.webkit.JavascriptInterface
import android.widget.Toast

class WebAppInterface(private val mContext: Context) {
    /**
     * 获取设备信息
     * @return 设备型号和系统版本
     */
    @JavascriptInterface
    fun getDeviceInfo(): String {
        return "Model: ${Build.MODEL}, OS: ${Build.VERSION.RELEASE}"
    }

    /**
     * 显示原生 Toast 提示
     * @param toast 提示内容
     */
    @JavascriptInterface
    fun showToast(toast: String) {
        Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show()
    }
}
