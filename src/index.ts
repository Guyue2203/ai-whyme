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
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>微米 - 智能对话助手</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="icon" type="image/png" href="https://s.guyue.me/img/icon_whyme.png" />
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: '#3B82F6',
          secondary: '#10B981',
          accent: '#8B5CF6',
          neutral: {
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          }
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
        animation: {
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'fadeIn': 'fadeIn 0.3s ease forwards',
        }
      },
    }
  }
</script>
<style>
  /* ========== 全局基础样式 ========== */
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: 'Inter', system-ui, sans-serif; 
    transition: background-color 0.3s ease, color 0.3s ease; 
  }
  
  /* ========== 滚动条美化 ========== */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { 
    background: rgba(155, 155, 155, 0.4); 
    border-radius: 3px; 
  }
  ::-webkit-scrollbar-thumb:hover { 
    background: rgba(155, 155, 155, 0.6); 
  }
  
  /* ========== 顶部导航栏渐变 ========== */
  .header-gradient {
    background: linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%);
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.25);
  }
  
  /* ========== 侧边栏毛玻璃效果 ========== */
  .sidebar-glass {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.7);
  }
  .dark .sidebar-glass {
    background: rgba(31, 41, 55, 0.8);
  }
  
  /* ========== 消息气泡样式 ========== */
  .message-bubble {
    padding: 16px;
    border-radius: 14px;
    max-width: 85%;
    line-height: 1.6;
    font-size: 15px;
    animation: fadeIn 0.3s ease forwards;
    position: relative;
  }

  .copy-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 6px;
    padding: 6px 8px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    font-size: 12px;
    opacity: 0;
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
  }

  .message-bubble:hover .copy-btn {
    opacity: 1;
  }

  .copy-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    color: white;
    transform: scale(1.05);
  }

  .copy-btn:active {
    transform: scale(0.95);
  }

  .copy-btn.copied {
    background: rgba(34, 197, 94, 0.8);
    color: white;
  }
  
  .message-user {
    background: linear-gradient(135deg, #3B82F6, #2563EB);
    color: white;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
  
  .message-assistant {
    background: linear-gradient(135deg, #10B981, #059669);
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  /* ========== 输入框渐变边框 ========== */
  .input-gradient-border {
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box, 
                linear-gradient(90deg, #3B82F6, #8B5CF6) border-box;
  }
  
  .dark .input-gradient-border {
    background: linear-gradient(rgb(31, 41, 55), rgb(31, 41, 55)) padding-box, 
                linear-gradient(90deg, #3B82F6, #8B5CF6) border-box;
  }
  
  /* ========== 按钮渐变效果 ========== */
  .btn-gradient {
    background: linear-gradient(90deg, #3B82F6, #8B5CF6);
    transition: all 0.25s ease;
  }
  
  .btn-gradient:hover {
    box-shadow: 0 0 10px rgba(139, 92, 246, 0.6);
    transform: scale(1.05);
  }
  
  .btn-gradient:active {
    transform: scale(0.95);
  }
  
  /* ========== 动画定义 ========== */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* ========== 状态提示框 ========== */
  .status-glass {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    border: none;
    border-radius: 10px;
    animation: fadeIn 0.3s ease forwards;
  }
</style>
<link rel="stylesheet" href="styles.css">
</head>
<body class="bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 min-h-screen transition-colors duration-300">
  <div class="flex flex-col h-screen max-h-screen overflow-hidden">
    <!-- 顶部导航栏 -->
    <header class="header-gradient text-white shadow-sm z-10 transition-all duration-300">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <img src="https://s.guyue.me/img/icon_whyme.png" alt="微米" class="w-8 h-8 rounded-full" />
          </div>
          <h1 class="text-xl font-bold text-white">微米</h1>
        </div>
        
        <div class="flex items-center space-x-4">
          <button id="info-btn" class="p-2 rounded-full hover:bg-white/20 transition-colors" title="关于微米">
            <i class="fa fa-info-circle text-white"></i>
          </button>
          <button id="theme-toggle" class="p-2 rounded-full hover:bg-white/20 transition-colors">
            <i class="fa fa-moon-o dark:hidden text-white"></i>
            <i class="fa fa-sun-o hidden dark:block text-yellow-300"></i>
          </button>
        </div>
      </div>
    </header>
    
    <!-- 主聊天区域 -->
     <main class="flex-1 flex overflow-hidden">
       <!-- 侧边栏 - 对话历史 -->
       <aside id="sidebar" class="w-64 sidebar-glass shadow-md z-10 transition-all duration-300 transform -translate-x-full md:translate-x-0 fixed md:static h-[calc(100%-64px)] md:h-auto">
         <div class="p-4 border-b dark:border-neutral-700">
           <button class="new-chat-btn w-full btn-gradient text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2" onclick="newChat()" title="新建对话">
             <i class="fa fa-plus"></i>
             <span>新对话</span>
           </button>
         </div>
         
         <div class="overflow-y-auto h-[calc(100%-120px)] scrollbar-hide">
           <div class="p-3">
             <h3 class="text-xs uppercase text-neutral-500 dark:text-neutral-400 font-semibold px-3 mb-2">最近对话</h3>
             <ul class="space-y-1">
               <li>
                 <button class="w-full text-left p-3 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">
                   <div class="truncate">如何学习前端开发？</div>
                 </button>
               </li>
               <li>
                 <button class="w-full text-left p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                   <div class="truncate">推荐几本经典的编程书籍</div>
                 </button>
               </li>
               <li>
                 <button class="w-full text-left p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                   <div class="truncate">解释一下机器学习的基本概念</div>
                 </button>
               </li>
             </ul>
           </div>
         </div>
         
         <div class="p-4 border-t dark:border-neutral-700 absolute bottom-0 w-full">
           <button id="clear-history-btn" class="w-full text-neutral-600 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
             <i class="fa fa-trash-o"></i>
             <span>清除历史</span>
           </button>
         </div>
       </aside>
       
       <!-- 聊天内容区 -->
       <div class="flex-1 flex flex-col overflow-hidden">
         <!-- 移动端侧边栏切换按钮 -->
         <button id="sidebar-toggle" class="md:hidden absolute top-16 left-4 z-20 bg-white dark:bg-neutral-800 shadow-md p-2 rounded-full">
           <i class="fa fa-bars text-neutral-600 dark:text-neutral-300"></i>
         </button>
         
         <!-- 消息列表 -->
          <div id="history" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide bg-neutral-100 dark:bg-neutral-900"></div>
      
      <!-- 输入区域 -->
         <div class="bg-white dark:bg-neutral-800 p-4 shadow-inner border-t dark:border-neutral-700">
           <div class="max-w-3xl mx-auto">
             <div class="flex items-end space-x-3">
               <div class="flex-1 relative">
                 <textarea 
                   id="prompt" 
                   placeholder="向微米发送消息..." 
                   class="w-full p-3 pr-10 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:input-gradient-border resize-none transition-all min-h-[50px] max-h-[200px] overflow-y-auto scrollbar-hide"
                   rows="1"
                 ></textarea>
                 <div class="absolute right-3 bottom-3 text-neutral-500">
                   <i class="fa fa-smile-o hover:text-primary cursor-pointer transition-colors"></i>
                 </div>
               </div>
               <button 
                 id="sendBtn" 
                 onclick="send()"
                 class="btn-gradient text-white p-3 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                 disabled
               >
                 <i class="fa fa-paper-plane"></i>
               </button>
             </div>
             <div class="flex justify-between items-center mt-2 text-xs text-neutral-500 dark:text-neutral-400">
               <div>按 Enter 发送消息，Shift+Enter 换行</div>
               <div class="flex space-x-3">
                 <button class="hover:text-primary transition-colors">
                   <i class="fa fa-paperclip"></i>
                 </button>
                 <button class="hover:text-primary transition-colors">
                   <i class="fa fa-microphone"></i>
                 </button>
               </div>
             </div>
           </div>
         </div>
       </div>
     </main>
  </div>
  
  <div class="status" id="out"></div>

   <!-- 详情模态框 -->
   <div id="info-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
     <div class="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
       <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-neutral-800 dark:text-white flex items-center">
            <img src="https://s.guyue.me/img/icon_whyme.png" alt="微米" class="w-6 h-6 rounded-full mr-2" />
            关于微米
          </h3>
         <button id="close-modal" class="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors">
           <i class="fa fa-times text-neutral-500 dark:text-neutral-400"></i>
         </button>
       </div>
       <div class="space-y-4 text-neutral-600 dark:text-neutral-300">
         <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center p-1">
              <img src="https://s.guyue.me/img/icon_whyme.png" alt="微米" class="w-full h-full rounded-full" />
            </div>
            <div>
              <h4 class="font-semibold text-neutral-800 dark:text-white">微米 AI 助手</h4>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">智能对话助手</p>
            </div>
          </div>
         <div class="border-t dark:border-neutral-700 pt-4">
           <p class="text-sm leading-relaxed">
             微米是一款基于先进AI技术的智能对话助手，能够通过对话为您提供一些信息和建议。
           </p>
         </div>
         <div class="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-4">
           <div class="flex items-center justify-between text-sm">
             <span class="text-neutral-500 dark:text-neutral-400">开发团队</span>
             <a href="https://whyme.uno/" target="_blank" class="font-medium text-primary hover:text-accent transition-colors cursor-pointer">微米工作室</a>
           </div>
           <div class="flex items-center justify-between text-sm mt-2">
             <span class="text-neutral-500 dark:text-neutral-400">版本</span>
             <span class="font-medium">v1.0.0</span>
           </div>
         </div>
         <div class="text-center pt-2">
           <p class="text-xs text-neutral-400 dark:text-neutral-500">
             © 2025 <a href="https://whyme.uno/" target="_blank" class="hover:text-primary transition-colors cursor-pointer">微米工作室</a>
           </p>
         </div>
       </div>
     </div>
   </div>

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
const infoBtn = document.getElementById('info-btn');
const infoModal = document.getElementById('info-modal');
const closeModal = document.getElementById('close-modal');

function append(role, text) {
  const messageContainer = document.createElement('div');
  messageContainer.className = 'flex ' + (role === 'user' ? 'justify-end' : 'justify-start') + ' mb-4';
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-bubble message-' + role;
  messageDiv.innerHTML = text;
  
  // 添加复制按钮
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.innerHTML = '<i class="fa fa-copy"></i>';
  copyBtn.title = '复制消息';
  copyBtn.onclick = function() {
    copyMessage(messageDiv, copyBtn);
  };
  
  messageDiv.appendChild(copyBtn);
  messageContainer.appendChild(messageDiv);
  histEl.appendChild(messageContainer);
  histEl.scrollTop = histEl.scrollHeight;
  
  return messageDiv;
}

function showStatus(message, isError = false) {
  outEl.textContent = message;
  outEl.className = 'status-glass show fixed bottom-6 left-1/2 transform -translate-x-1/2 text-white px-4 py-3 rounded-lg z-50';
  setTimeout(() => {
    outEl.className = 'status-glass fixed bottom-6 left-1/2 transform -translate-x-1/2 text-white px-4 py-3 rounded-lg z-50 hidden';
  }, 3000);
}

function copyMessage(messageDiv, copyBtn) {
  // 获取消息文本内容，排除复制按钮
  const copyBtnClone = copyBtn.cloneNode(true);
  copyBtn.style.display = 'none';
  const textContent = messageDiv.textContent || messageDiv.innerText;
  copyBtn.style.display = '';
  
  // 复制到剪贴板
  navigator.clipboard.writeText(textContent).then(() => {
    // 显示复制成功状态
    copyBtn.innerHTML = '<i class="fa fa-check"></i>';
    copyBtn.classList.add('copied');
    showStatus('消息已复制到剪贴板');
    
    // 2秒后恢复原状
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fa fa-copy"></i>';
      copyBtn.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    // 如果现代API失败，使用传统方法
    const textArea = document.createElement('textarea');
    textArea.value = textContent;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      copyBtn.innerHTML = '<i class="fa fa-check"></i>';
      copyBtn.classList.add('copied');
      showStatus('消息已复制到剪贴板');
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fa fa-copy"></i>';
        copyBtn.classList.remove('copied');
      }, 2000);
    } catch (e) {
      showStatus('复制失败，请手动选择文本', true);
    }
    document.body.removeChild(textArea);
  });
}

function newChat() {
  histEl.innerHTML = '';
  promptEl.value = '';
  showStatus('新对话已开始');
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
  }

  // 详情模态框事件
  if (infoBtn) {
    infoBtn.addEventListener('click', function() {
      infoModal.classList.remove('hidden');
    });
  }

  if (closeModal) {
    closeModal.addEventListener('click', function() {
      infoModal.classList.add('hidden');
    });
  }

  // 点击模态框背景关闭
  if (infoModal) {
    infoModal.addEventListener('click', function(e) {
      if (e.target === infoModal) {
        infoModal.classList.add('hidden');
      }
    });
  }

  // ESC键关闭模态框
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !infoModal.classList.contains('hidden')) {
      infoModal.classList.add('hidden');
    }
  });

  // 点击外部关闭侧边栏
  document.addEventListener('click', function(e) {
     const sidebar = document.getElementById('sidebar');
     const toggle = document.querySelector('.sidebar-toggle');
     if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
       sidebar.classList.remove('open');
     }
   });`;

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
        const { prompt } = await request.json();
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

