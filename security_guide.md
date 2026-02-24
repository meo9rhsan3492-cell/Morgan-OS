# 🔐 如何保护您的 Gemini API Key

由于 Morgan OS 是纯前端运行的网页应用（Static Web App），您的 API Key 需要存储在浏览器中才能调用 Google 的服务。这意味着 **HTTP Referrer 限制** 是保护您 Key 不被盗用的唯一且最有效的方法。

## 什么是 HTTP Referrer 限制？

它就像给您的 Key 加了一把只认门牌号的锁。

- **允许**：只有从 `https://morganos.zeabur.app` 或 `http://localhost` 发出的请求。
- **拒绝**：如果有黑客偷了您的 Key 想在他的电脑上用 -> **直接报错拒绝**。

## 🛡️ 设置步骤 (30秒搞定)

1. **访问 Google AI Studio**
    点击链接打开：[Google AI Studio API Key 管理](https://aistudio.google.com/app/apikey)

2. **选择您的 Key**
    在列表中找到您正在使用的 API Key，点击它进入编辑界面。

3. **配置限制 (API Restrictions)**
    - 找到 **"Application restrictions"** (应用限制)
    - 选择 **"Web sites"** (网站)

4. **添加白名单网址 (Web site restrictions)**
    点击 **"Add"** 并逐行添加以下两个网址：

    ```text
    https://morganos.zeabur.app/*
    ```

    *(用于您的在线部署版本)*

    ```text
    http://localhost:*
    ```

    *(用于您的本地预览测试)*

5. **保存 (Save)**
    点击保存。

---

## ✅ 验证是否成功

设置完成后：

1. 打开您的 Morgan OS 网页，尝试生成一条社媒文案。如果有结果，说明配置正确。
2. (可选测试) 如果您想测试保护效果，可以把 Key 发给朋友让他试用，他一定无法使用，因为他的请求不是从您的域名发出的。
