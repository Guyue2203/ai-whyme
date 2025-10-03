/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// 读取静态文件内容
const indexHtml = `<!doctype html>
<html lang="zh-CN" class="notranslate" translate="no">
<head>
<meta charset="utf-8" />
<title>微米 - 智能对话助手</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="description" content="微米 AI 助手 - 您的智能对话伙伴，提供编程、写作、学习等全方位AI支持" />
<link rel="icon" type="image/png" href="https://s.guyue.me/img/icon_whyme.png" />
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: '#2563eb',
          secondary: '#059669',
          accent: '#7c3aed',
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        }
      },
    }
  }
</script>
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body { 
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* 消息容器样式 */
  .message-container {
    max-width: 768px;
    margin: 0 auto;
    padding: 24px 16px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }
  
  .message-user .message-container {
    background: transparent;
  }
  
  .message-assistant .message-container {
    background: #f8fafc;
  }
  
  .dark .message-assistant .message-container {
    background: #1e293b;
  }
  
  /* 头像样式 */
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    flex-shrink: 0;
    overflow: hidden;
  }
  
  .avatar-user {
    background: #2563eb;
    color: white;
  }
  
  .avatar-assistant {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
  }
  
  .dark .avatar-assistant {
    background: #374151;
    border-color: #4b5563;
  }
  
  .avatar-assistant img {
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }
  
  /* 消息内容样式 */
  .message-content {
    flex: 1;
    line-height: 1.7;
    color: #111827;
    font-size: 15px;
  }
  
  .dark .message-content {
    color: #f9fafb;
  }
  
  .message-user .message-content {
    color: #111827;
  }
  
  .dark .message-user .message-content {
    color: #f9fafb;
  }
  
  .message-assistant .message-content {
    color: #374151;
  }
  
  .dark .message-assistant .message-content {
    color: #e5e7eb;
  }
  
  /* 输入框样式 */
  .input-container {
    position: relative;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    transition: all 0.2s ease;
  }
  
  .dark .input-container {
    background: #374151;
    border-color: #4b5563;
  }
  
  .input-container:focus-within {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .dark .input-container:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  /* 发送按钮样式 */
  .send-button {
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 36px;
    height: 36px;
    background: #2563eb;
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .send-button:hover {
    background: #1d4ed8;
    transform: scale(1.05);
  }
  
  .send-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
  
  /* 打字指示器 */
  .typing-indicator {
    display: flex;
    gap: 4px;
    padding: 8px 0;
  }
  
  .typing-dot {
    width: 6px;
    height: 6px;
    background: #9ca3af;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;
  }
  
  .typing-dot:nth-child(1) { animation-delay: -0.32s; }
  .typing-dot:nth-child(2) { animation-delay: -0.16s; }
  
  @keyframes typing {
    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
  }
  
  /* 状态提示 */
  .status-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .status-toast.show {
    opacity: 1;
  }
  
  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  
  .dark ::-webkit-scrollbar-thumb {
    background: #4b5563;
  }
  
  .dark ::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
</style>
<link rel="stylesheet" href="styles.css">
</head>
<body class="bg-white dark:bg-gray-900 min-h-screen">
  <div class="min-h-screen flex flex-col">
    <!-- 顶部导航栏 -->
    <header class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">微</span>
            </div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">微米 AI</h1>
          </div>
          <button id="theme-toggle" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg class="w-5 h-5 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
            <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 主聊天区域 -->
    <main class="flex-1 flex flex-col">
      <!-- 消息列表 -->
      <div id="history" class="flex-1 overflow-y-auto"></div>
      
      <!-- 输入区域 -->
      <div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div class="max-w-4xl mx-auto p-4">
          <div class="input-container">
            <textarea 
              id="prompt" 
              placeholder="向微米发送消息..." 
              class="w-full p-4 pr-12 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none"
              rows="1"
            ></textarea>
            <button 
              id="sendBtn" 
              onclick="send()"
              class="send-button"
              disabled
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </div>
          <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            按 Enter 发送消息，Shift+Enter 换行
          </div>
        </div>
      </div>
    </main>
  </div>
  
  <div class="status" id="out"></div>

  <script src="app.js"></script>
</body>
</html>`;

const stylesCss = `* { margin: 0; padding: 0; box-sizing: border-box; }

/* body样式由Tailwind CSS处理 */

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 新建对话按钮样式由Tailwind CSS处理 */

.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid #2d2d2d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #212121;
}

.chat-title {
  font-size: 18px;
  font-weight: 600;
  color: #ececec;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.message-group {
  border-bottom: 1px solid #2d2d2d;
}

.message {
  max-width: 768px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.message.user {
  background: #212121;
}

.message.assistant {
  background: #1a1a1a;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #10a37f;
  color: white;
}

.message.assistant .message-avatar {
  background: #ab68ff;
  color: white;
}

.message.system .message-avatar {
  background: #ff6b6b;
  color: white;
}

.message-content {
  flex: 1;
  line-height: 1.6;
  color: #ececec;
  font-size: 16px;
}

.message.user .message-content {
  color: #ececec;
}

.message.assistant .message-content {
  color: #ececec;
}

.message.system .message-content {
  color: #b4b4b4;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 14px;
}

.input-area {
  padding: 24px;
  background: #212121;
  border-top: 1px solid #2d2d2d;
}

.input-container {
  max-width: 768px;
  margin: 0 auto;
  position: relative;
}

.input-wrapper {
  position: relative;
  background: #2d2d2d;
  border-radius: 12px;
  border: 1px solid #4d4d4d;
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #10a37f;
  box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.2);
}

#prompt {
  width: 100%;
  min-height: 52px;
  max-height: 200px;
  padding: 16px 52px 16px 16px;
  background: transparent;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  resize: none;
  outline: none;
  color: #ececec;
  line-height: 1.5;
}

#prompt::placeholder {
  color: #8e8ea0;
}

.send-button {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 36px;
  height: 36px;
  background: #10a37f;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 16px;
}

.send-button:hover {
  background: #0d8f6b;
}

.send-button:disabled {
  background: #4d4d4d;
  cursor: not-allowed;
}

.status {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #2d2d2d;
  border: 1px solid #4d4d4d;
  border-radius: 8px;
  padding: 12px 16px;
  color: #b4b4b4;
  font-size: 14px;
  max-width: 400px;
  z-index: 1000;
  display: none;
}

.status.show {
  display: block;
}

.loading {
   display: inline-flex;
   align-items: center;
   gap: 8px;
   color: #b4b4b4;
 }

 .loading::after {
   content: '';
   width: 16px;
   height: 16px;
   border: 2px solid #4d4d4d;
   border-top: 2px solid #10a37f;
   border-radius: 50%;
   animation: spin 1s linear infinite;
 }

 .typing-indicator {
   display: flex;
   gap: 4px;
   padding: 16px 0;
 }

 .typing-dot {
   width: 8px;
   height: 8px;
   background: #8e8ea0;
   border-radius: 50%;
   animation: typing 1.4s infinite ease-in-out;
 }

 .typing-dot:nth-child(1) { animation-delay: -0.32s; }
 .typing-dot:nth-child(2) { animation-delay: -0.16s; }

 @keyframes typing {
   0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
   40% { transform: scale(1); opacity: 1; }
 }

 @keyframes spin {
   to { transform: rotate(360deg); }
 }

 @media (max-width: 768px) {
    .message {
      padding: 16px;
    }
   
    .input-area {
      padding: 16px;
    }
   
    .chat-header {
      padding: 12px 16px;
    }
  }

 ::-webkit-scrollbar {
   width: 6px;
 }

 ::-webkit-scrollbar-track {
   background: #2d2d2d;
 }

 ::-webkit-scrollbar-thumb {
   background: #4d4d4d;
   border-radius: 3px;
 }

 ::-webkit-scrollbar-thumb:hover {
   background: #6d6d6d;
 }
`;

const appJs = `const histEl = document.getElementById("history");
const outEl = document.getElementById("out");
const sendBtn = document.getElementById("sendBtn");
const promptEl = document.getElementById("prompt");
const themeToggle = document.getElementById('theme-toggle');

function append(role, text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-' + role;
  
  const container = document.createElement('div');
  container.className = 'message-container';
  
  const avatar = document.createElement('div');
  avatar.className = 'avatar avatar-' + role;
  
  if (role === 'user') {
    avatar.textContent = '你';
  } else {
    // 微米AI使用网页图标
    const img = document.createElement('img');
    img.src = 'https://s.guyue.me/img/icon_whyme.png';
    img.alt = '微米AI';
    avatar.appendChild(img);
  }
  
  const content = document.createElement('div');
  content.className = 'message-content';
  content.innerHTML = text;
  
  container.appendChild(avatar);
  container.appendChild(content);
  messageDiv.appendChild(container);
  
  histEl.appendChild(messageDiv);
  histEl.scrollTop = histEl.scrollHeight;
  
  return content;
}

function showStatus(message, isError = false) {
  outEl.textContent = message;
  outEl.className = 'status-toast show';
  setTimeout(() => {
    outEl.className = 'status-toast';
  }, 3000);
}

// 主题切换功能
function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

// 初始化主题
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
}

function updateSendButton() {
  const hasText = promptEl.value.trim().length > 0;
  sendBtn.disabled = !hasText;
}

async function send() {
   const prompt = promptEl.value.trim();
   if (!prompt) return;
   
   // 禁用发送按钮
   sendBtn.disabled = true;
   
   // 添加用户消息
   append("user", prompt);
   promptEl.value = "";
   updateSendButton();
   
   // 创建AI消息容器并显示打字指示器
   const messageContent = append("assistant", '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>');

   try {
     const res = await fetch("/api", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ prompt })
     });
     const data = await res.json();
     if (data.error) {
       showStatus("出错: " + data.error, true);
       messageContent.innerHTML = "抱歉，处理您的请求时出现了错误。";
     } else {
       const reply = data.output ?? JSON.stringify(data, null, 2);
       // 模拟流式输出效果
       await typewriterEffect(messageContent, reply);
     }
   } catch (e) {
     showStatus("请求失败: " + e, true);
     messageContent.innerHTML = "网络连接出现问题，请稍后重试。";
   } finally {
     sendBtn.disabled = false;
     updateSendButton();
   }
 }

// 打字机效果函数
 async function typewriterEffect(element, text, speed = 20) {
   element.innerHTML = '';
   for (let i = 0; i < text.length; i++) {
     element.innerHTML += text[i];
     histEl.scrollTop = histEl.scrollHeight;
     await new Promise(resolve => setTimeout(resolve, speed));
   }
 }
 

 
 // 自动调整文本框高度
 function autoResize() {
   promptEl.style.height = 'auto';
   promptEl.style.height = Math.min(promptEl.scrollHeight, 200) + 'px';
 }
 
 // 事件监听器
 promptEl.addEventListener('input', function() {
   updateSendButton();
   autoResize();
 });
 
 promptEl.addEventListener('keydown', function(e) {
   if (e.key === 'Enter' && !e.shiftKey) {
     e.preventDefault();
     if (!sendBtn.disabled) {
       send();
     }
   }
 });
 
  // 更新发送按钮状态
  updateSendButton();

  // 初始化主题
  initializeTheme();

  // 绑定主题切换事件
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }`;

// 静态文件内容
const staticFiles: Record<string, { content: string; contentType: string }> = {
  '/': {
    content: indexHtml,
    contentType: 'text/html; charset=utf-8'
  },
  '/styles.css': {
    content: stylesCss,
    contentType: 'text/css; charset=utf-8'
  },
  '/app.js': {
    content: appJs,
    contentType: 'application/javascript; charset=utf-8'
  }
};

// 简单 hash 以避免缓存冲突（可替换）
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      
      if (url.pathname === "/api" && request.method === "POST") {
        const requestBody = await request.json() as { prompt?: string };
        const { prompt } = requestBody;
        if (!prompt || typeof prompt !== "string") {
          return new Response(JSON.stringify({ error: "prompt 不能为空" }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
          });
        }

        // 可选：做简单缓存（根据 prompt ）
        const cacheKey = `reply-${hashString(prompt)}`;
        const cached = await env['hello-ai-kv']?.get(cacheKey);
        if (cached) {
          return new Response(cached, {
            headers: { 
              "Content-Type": "application/json",
              "X-Cache": "HIT"
            },
          });
        }

        // 调用 Workers AI（你原来的模型）
        const response = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          prompt: prompt,
          temperature: 0.7,
          max_output_tokens: 512,
          // 你可以在这里加更多配置项
        });

        const body = {
          output: response.response ?? response.output ?? "",
          raw: response,
          timestamp: Date.now(),
        };

        // 缓存短期结果（使用环境变量配置TTL）
        const cacheTtl = parseInt(env.CACHE_TTL || "60");
        if (env['hello-ai-kv']) {
           await env['hello-ai-kv'].put(cacheKey, JSON.stringify(body), {
             expirationTtl: cacheTtl,
           });
        }

        return new Response(JSON.stringify(body), {
          headers: { 
            "Content-Type": "application/json",
            "X-Cache": "MISS",
            "X-App-Name": env.APP_NAME || "AI Chat",
            "X-Version": env.VERSION || "1.0.0"
          },
        });
      }

      // 静态文件服务
      if (request.method === "GET" && staticFiles[url.pathname]) {
        const file = staticFiles[url.pathname];
        return new Response(file.content, {
          headers: { "Content-Type": file.contentType },
        });
      }

      return new Response("Not Found", { status: 404 });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message || String(e) }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
  },
};

