# 主应用添加 SEO AI 链接 - 手动操作指南

由于自动编辑大HTML文件存在技术问题，请您手动完成以下简单操作：

## 📍 需要修改的位置

打开文件：`index.html`（或 `index_v18.1.html`）

找到第 **141-143** 行，即导航栏结束部分：

```html
            <button onclick="switchTab('budget')" class="nav-item"
                id="nav-budget"><span>📊</span><span>资金看板</span></button>
        </nav>
```

## ✏️ 需要添加的代码

在第142行（资金看板按钮）后面，`</nav>` 标签**之前**，添加以下3行代码：

```html
            <div class="px-4 mb-2 mt-4 text-xs font-bold text-blue-400 uppercase">AI 助手</div>
            <a href="seo_ai.html" target="_blank" class="nav-item" style="display: flex; align-items: center; gap: 12px; text-decoration: none;">
                <span>🤖</span><span>SEO AI</span>
            </a>
```

## 🎯 修改后的完整代码

修改后，第 141-146 行应该是：

```html
            <button onclick="switchTab('budget')" class="nav-item"
                id="nav-budget"><span>📊</span><span>资金看板</span></button>
            <div class="px-4 mb-2 mt-4 text-xs font-bold text-blue-400 uppercase">AI 助手</div>
            <a href="seo_ai.html" target="_blank" class="nav-item" style="display: flex; align-items: center; gap: 12px; text-decoration: none;">
                <span>🤖</span><span>SEO AI</span>
            </a>
        </nav>
```

## ✅ 完成后

保存文件，刷新浏览器，您会在左侧导航栏底部看到新的 **"AI 助手"** 分类和 **"SEO AI"** 链接。

**点击 "SEO AI"会在新标签页打开 SEO AI 工作站。**

---

**预计操作时间**: 不到1分钟 ⏱️
