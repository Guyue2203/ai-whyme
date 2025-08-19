# 微米AI

欢迎来到 **微米AI**，一个基于 Cloudflare AI 的智能对话网页应用！  

你可以在这里直接与 AI 交流，获得问题解答、创意灵感或信息分析。  

访问入口：[https://ai.whyme.uno](https://ai.whyme.uno)  

---

## 🔹 功能亮点

- **智能问答**：基于 Llama 3 8B 模型，理解你的提问并生成回答  
- **上下文记忆**：支持多轮对话，让交流更自然  
- **快速响应**：部署在 Cloudflare Workers，网页访问即可体验  
- **跨平台访问**：无需安装任何软件  

---

## 💡 使用方式

1. 打开网页：[https://ai.whyme.uno](https://ai.whyme.uno)  
2. 在输入框中输入你的问题  
3. 等待 AI 回答  
4. 支持多轮对话，尝试各种话题（学习、生活、科技、创意灵感）  

---

## ⚙️ 构建与部署流程（简要介绍）

1. **开发阶段**
   - 使用 **TypeScript + Wrangler** 开发 Worker 入口 `index.ts`
   - 集成 **Cloudflare AI** 绑定，处理用户请求
   - 集成 **KV 存储**，保存对话上下文或缓存数据
   - 本地可运行 `npx wrangler dev` 进行测试  

2. **版本控制**
   - 项目代码托管在 **GitHub**
   - `.gitignore` 配置忽略本地依赖、日志等文件  

3. **自动部署**
   - 使用 **GitHub Actions**
   - 每次推送到 `main` 分支，自动触发 `wrangler deploy`
   - GitHub Actions 使用 **Secrets** 提供 Cloudflare API Token 和 Account ID
   - Node.js 版本 ≥20 保证 Wrangler 正常运行  

4. **线上访问**
   - 部署到 **Cloudflare Workers**
   - 网页访问即可调用 AI 和 KV 绑定，实现智能问答  

---

## 📌 注意事项

- 本应用用于学习和娱乐，不适合作为专业医疗、法律或投资建议来源  
- 对话数据仅用于生成即时回答，不会公开分享  

---

## 🌐 访问与体验

> 打开网页即可与 AI 对话，无需注册或登录  
> 访问入口：[https://ai.whyme.uno](https://ai.whyme.uno)  

---

感谢你使用 **微米AI**，希望你能在这里获得有趣和实用的 AI 体验！
