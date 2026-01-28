# 知识库升级整合指南

## 🎯 整合步骤

您现在有两个文件：
1. `index_v2.html` - 当前稳定版本 (v18.0)
2. `knowledge_base_upgrade.html` - 知识库升级代码

### 方法 1: 手动整合（推荐

由于系统限制，我推荐您手动完成最后一步整合：

1. **打开文件**
   - 用文本编辑器打开 `index_v2.html`
   - 用另一个窗口打开 `knowledge_base_upgrade.html`

2. **HTML部分替换**（第194-211行）
   ```
   找到这段代码：
   <!-- Product DB -->
   <div id="product-db" class="tab-content">
   ...中间所有内容...
   </div>
   
   替换为 knowledge_base_upgrade.html 中的 HTML 部分（最上面那一大段）
   ```

3. **JavaScript代码添加**（在第587行之前）
   ```
   找到：
   window.onload = function () {
   
   在这之前添加 knowledge_base_upgrade.html 中的 JavaScript 代码
   ```

4. **版本号更新**（第122行）
   ```
   将: v18.0 数据联动版
   改为: v18.1 智能知识库版
   ```

### 方法 2: 使用预备好的完整版

或者，让我为您创建一个完整整合好的新版本...

---

## ✨ 升级后的新功能

### 1. 文件上传 📎
- 支持 TXT, MD, JSON 格式
- 拖拽或点击上传
- 自动解析和存储

### 2. 文档管理 📚
- 查看所有已上传文档
- 点击查看完整内容
- 快速删除不需要的文档

### 3. 智能检索 🔍
- 实时全文搜索
- 关键词高亮显示
- 摘要片段显示

### 4. 知识库统计 📊
- 文档数量统计
- 总字符数统计
- 实时更新

### 5. 文档查看器 👁️
- 弹窗查看完整内容
- 保留格式显示
- 大文件友好

---

## 🔧 技术细节

### 数据存储
```javascript
// localStorage key: tds_knowledge_base
// 数据结构
[
  {
    id: 1732601234567,
    filename: "产品规格.txt",
    type: "txt",
    uploadDate: "2025-11-26",
    content: "完整文本内容...",
    size: 1234
  }
]
```

### 核心函数
- `handleKnowledgeFileUpload()` - 文件上传处理
- `renderKnowledgeDocs()` - 渲染文档列表
- `searchKnowledge()` - 智能检索
- `viewDocument()` - 查看文档详情
- `deleteDocument()` - 删除文档

---

##您希望我：
A) 手动整合（按照上面的指南）
B) 我为您创建一个完整整合好的新文件
