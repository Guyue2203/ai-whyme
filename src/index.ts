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
  
  /* 输入框文本样式 */
  #prompt {
    color: #111827 !important;
    background: transparent !important;
  }
  
  .dark #prompt {
    color: #f9fafb !important;
  }
  
  #prompt::placeholder {
    color: #6b7280 !important;
  }
  
  .dark #prompt::placeholder {
    color: #9ca3af !important;
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

    <!-- 登录/注册模态框 -->
    <div id="auth-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 id="auth-title" class="text-xl font-bold text-gray-900 dark:text-white">登录</h2>
          <button id="close-auth" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- 登录表单 -->
        <div id="login-form">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">邮箱</label>
              <input type="email" id="login-email" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入邮箱">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">密码</label>
              <input type="password" id="login-password" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入密码">
            </div>
            <button id="login-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors">
              登录
            </button>
            <div class="text-center">
              <span class="text-gray-600 dark:text-gray-400">还没有账号？</span>
              <button id="switch-to-register" class="text-blue-500 hover:text-blue-600 font-medium">立即注册</button>
            </div>
          </div>
        </div>
        
        <!-- 注册表单 -->
        <div id="register-form" class="hidden">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">邮箱</label>
              <input type="email" id="register-email" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入邮箱">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">密码</label>
              <input type="password" id="register-password" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入密码">
            </div>
            <button id="register-btn" class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition-colors">
              注册
            </button>
            <div class="text-center">
              <span class="text-gray-600 dark:text-gray-400">已有账号？</span>
              <button id="switch-to-login" class="text-blue-500 hover:text-blue-600 font-medium">立即登录</button>
            </div>
          </div>
        </div>
        
        <!-- 验证表单 -->
        <div id="verify-form" class="hidden">
          <div class="space-y-4">
            <div class="text-center">
              <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">验证邮箱</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">我们已向您的邮箱发送了验证码，请查收并输入验证码</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">验证码</label>
              <input type="text" id="verify-code" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入6位验证码">
            </div>
            <button id="verify-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors">
              验证
            </button>
            <div class="text-center">
              <button id="resend-code" class="text-blue-500 hover:text-blue-600 font-medium">重新发送验证码</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主聊天区域 -->
    <main class="flex-1 flex flex-col">
      <!-- 用户信息栏 -->
      <div id="user-info" class="hidden border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-white font-bold text-sm">U</span>
            </div>
            <span id="user-email" class="text-gray-700 dark:text-gray-300 font-medium"></span>
          </div>
          <div class="flex items-center space-x-2">
            <button id="view-history" class="text-blue-500 hover:text-blue-600 text-sm font-medium">查看历史</button>
            <button id="logout" class="text-red-500 hover:text-red-600 text-sm font-medium">退出登录</button>
          </div>
        </div>
      </div>
      
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

// 认证相关元素
const authModal = document.getElementById('auth-modal');
const closeAuth = document.getElementById('close-auth');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const verifyForm = document.getElementById('verify-form');
const userInfo = document.getElementById('user-info');
const userEmail = document.getElementById('user-email');

// 认证状态
let currentUser = null;
let authToken = null;
let pendingEmail = null;

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

// 认证相关函数
function showAuthModal() {
  authModal.classList.remove('hidden');
  showLoginForm();
}

function hideAuthModal() {
  authModal.classList.add('hidden');
}

function showLoginForm() {
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  verifyForm.classList.add('hidden');
  document.getElementById('auth-title').textContent = '登录';
}

function showRegisterForm() {
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
  verifyForm.classList.add('hidden');
  document.getElementById('auth-title').textContent = '注册';
}

function showVerifyForm() {
  loginForm.classList.add('hidden');
  registerForm.classList.add('hidden');
  verifyForm.classList.remove('hidden');
  document.getElementById('auth-title').textContent = '验证邮箱';
}

async function register() {
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  
  if (!email || !password) {
    showStatus('请填写完整信息', true);
    return;
  }
  
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      pendingEmail = email;
      showVerifyForm();
      showStatus(data.message);
    } else {
      showStatus(data.error, true);
    }
  } catch (error) {
    showStatus('注册失败，请稍后重试', true);
  }
}

async function verifyEmail() {
  const code = document.getElementById('verify-code').value;
  
  if (!code) {
    showStatus('请输入验证码', true);
    return;
  }
  
  try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingEmail, code })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showStatus(data.message);
      showLoginForm();
      document.getElementById('login-email').value = pendingEmail;
    } else {
      showStatus(data.error, true);
    }
  } catch (error) {
    showStatus('验证失败，请稍后重试', true);
  }
}

async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  if (!email || !password) {
    showStatus('请填写完整信息', true);
    return;
  }
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      authToken = data.token;
      currentUser = data.email;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', currentUser);
      
      hideAuthModal();
      updateUI();
      showStatus('登录成功');
      loadHistory();
    } else {
      showStatus(data.error, true);
    }
  } catch (error) {
    showStatus('登录失败，请稍后重试', true);
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  
  updateUI();
  histEl.innerHTML = '';
  showStatus('已退出登录');
}

function updateUI() {
  if (currentUser) {
    userInfo.classList.remove('hidden');
    userEmail.textContent = currentUser;
  } else {
    userInfo.classList.add('hidden');
  }
}

async function loadHistory() {
  if (!authToken) return;
  
  try {
    const response = await fetch('/api/history', {
      headers: { 'Authorization': \`Bearer \${authToken}\` }
    });
    
    if (response.ok) {
      const history = await response.json();
      histEl.innerHTML = '';
      
      history.forEach(conv => {
        append('user', conv.user);
        append('assistant', conv.assistant);
      });
    }
  } catch (error) {
    console.error('加载历史失败:', error);
  }
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
   
   // 检查是否已登录
   if (!currentUser) {
     showAuthModal();
     return;
   }
   
   // 禁用发送按钮
   sendBtn.disabled = true;
   
   // 添加用户消息
   append("user", prompt);
   promptEl.value = "";
   updateSendButton();
   
   // 创建AI消息容器并显示打字指示器
   const messageContent = append("assistant", '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>');

   try {
     const headers = { "Content-Type": "application/json" };
     if (authToken) {
       headers['Authorization'] = \`Bearer \${authToken}\`;
     }
     
     const res = await fetch("/api", {
       method: "POST",
       headers,
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

  // 初始化认证状态
  authToken = localStorage.getItem('authToken');
  currentUser = localStorage.getItem('currentUser');
  updateUI();
  
  if (currentUser) {
    loadHistory();
  }

  // 初始化主题
  initializeTheme();

  // 绑定主题切换事件
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // 认证相关事件监听器
  if (closeAuth) {
    closeAuth.addEventListener('click', hideAuthModal);
  }

  // 登录/注册切换
  document.getElementById('switch-to-register')?.addEventListener('click', showRegisterForm);
  document.getElementById('switch-to-login')?.addEventListener('click', showLoginForm);

  // 表单提交
  document.getElementById('login-btn')?.addEventListener('click', login);
  document.getElementById('register-btn')?.addEventListener('click', register);
  document.getElementById('verify-btn')?.addEventListener('click', verifyEmail);

  // 用户操作
  document.getElementById('logout')?.addEventListener('click', logout);
  document.getElementById('view-history')?.addEventListener('click', loadHistory);

  // 点击输入框时检查登录状态
  promptEl.addEventListener('focus', function() {
    if (!currentUser) {
      showAuthModal();
    }
  });

  // 点击模态框背景关闭
  if (authModal) {
    authModal.addEventListener('click', function(e) {
      if (e.target === authModal) {
        hideAuthModal();
      }
    });
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

// 用户认证相关函数
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  // 这里应该集成真实的邮件服务，如 SendGrid, AWS SES 等
  // 现在只是模拟发送
  console.log(`发送验证码到 ${email}: ${code}`);
  return true;
}

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      
      // 用户注册
      if (url.pathname === "/api/register" && request.method === "POST") {
        const { email, password } = await request.json() as { email?: string; password?: string };
        
        if (!email || !password) {
          return new Response(JSON.stringify({ error: "邮箱和密码不能为空" }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        // 检查邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return new Response(JSON.stringify({ error: "邮箱格式不正确" }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        // 检查用户是否已存在
        const existingUser = await env['hello-ai-kv']?.get(`user:${email}`);
        if (existingUser) {
          return new Response(JSON.stringify({ error: "该邮箱已被注册" }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        // 生成验证码
        const verificationCode = generateVerificationCode();
        const hashedPassword = await hashPassword(password);
        
        // 存储用户信息（待验证状态）
        await env['hello-ai-kv']?.put(`user:${email}`, JSON.stringify({
          email,
          password: hashedPassword,
          verified: false,
          verificationCode,
          createdAt: Date.now()
        }), { expirationTtl: 3600 }); // 1小时过期
        
        // 发送验证邮件
        await sendVerificationEmail(email, verificationCode);
        
        return new Response(JSON.stringify({ 
          message: "验证码已发送到您的邮箱，请查收并验证" 
        }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // 验证邮箱
      if (url.pathname === "/api/verify" && request.method === "POST") {
        const { email, code } = await request.json() as { email?: string; code?: string };
        
        if (!email || !code) {
          return new Response(JSON.stringify({ error: "邮箱和验证码不能为空" }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        const userData = await env['hello-ai-kv']?.get(`user:${email}`);
        if (!userData) {
          return new Response(JSON.stringify({ error: "用户不存在或验证码已过期" }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        const user = JSON.parse(userData);
        if (user.verificationCode !== code) {
          return new Response(JSON.stringify({ error: "验证码不正确" }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        // 更新用户状态为已验证
        user.verified = true;
        delete user.verificationCode;
        await env['hello-ai-kv']?.put(`user:${email}`, JSON.stringify(user));
        
        return new Response(JSON.stringify({ 
          message: "邮箱验证成功，现在可以登录了" 
        }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // 用户登录
      if (url.pathname === "/api/login" && request.method === "POST") {
        const { email, password } = await request.json() as { email?: string; password?: string };
        
        if (!email || !password) {
          return new Response(JSON.stringify({ error: "邮箱和密码不能为空" }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        const userData = await env['hello-ai-kv']?.get(`user:${email}`);
        if (!userData) {
          return new Response(JSON.stringify({ error: "用户不存在" }), {
            headers: { "Content-Type": "application/json" },
            status: 401,
          });
        }
        
        const user = JSON.parse(userData);
        if (!user.verified) {
          return new Response(JSON.stringify({ error: "请先验证邮箱" }), {
            headers: { "Content-Type": "application/json" },
            status: 401,
          });
        }
        
        const hashedPassword = await hashPassword(password);
        if (user.password !== hashedPassword) {
          return new Response(JSON.stringify({ error: "密码错误" }), {
            headers: { "Content-Type": "application/json" },
            status: 401,
          });
        }
        
        // 生成会话token
        const token = generateToken();
        await env['hello-ai-kv']?.put(`session:${token}`, JSON.stringify({
          email,
          loginTime: Date.now()
        }), { expirationTtl: 86400 * 7 }); // 7天过期
        
        return new Response(JSON.stringify({ 
          token,
          email: user.email 
        }), {
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // 获取用户对话历史
      if (url.pathname === "/api/history" && request.method === "GET") {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
          return new Response(JSON.stringify({ error: "未授权" }), {
            headers: { "Content-Type": "application/json" },
            status: 401,
          });
        }
        
        const sessionData = await env['hello-ai-kv']?.get(`session:${token}`);
        if (!sessionData) {
          return new Response(JSON.stringify({ error: "会话已过期" }), {
            headers: { "Content-Type": "application/json" },
            status: 401,
          });
        }
        
        const session = JSON.parse(sessionData);
        const history = await env['hello-ai-kv']?.get(`history:${session.email}`) || '[]';
        
        return new Response(history, {
          headers: { "Content-Type": "application/json" },
        });
      }
      
      if (url.pathname === "/api" && request.method === "POST") {
        const requestBody = await request.json() as { prompt?: string };
        const { prompt } = requestBody;
        if (!prompt || typeof prompt !== "string") {
          return new Response(JSON.stringify({ error: "prompt 不能为空" }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
          });
        }

        // 检查用户认证
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        let userEmail = null;
        
        if (token) {
          const sessionData = await env['hello-ai-kv']?.get(`session:${token}`);
          if (sessionData) {
            const session = JSON.parse(sessionData);
            userEmail = session.email;
          }
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

        // 如果用户已登录，保存对话历史
        if (userEmail) {
          const conversation = {
            user: prompt,
            assistant: body.output,
            timestamp: Date.now()
          };
          
          const existingHistory = await env['hello-ai-kv']?.get(`history:${userEmail}`) || '[]';
          const history = JSON.parse(existingHistory);
          history.push(conversation);
          
          // 只保留最近100条对话
          if (history.length > 100) {
            history.splice(0, history.length - 100);
          }
          
          await env['hello-ai-kv']?.put(`history:${userEmail}`, JSON.stringify(history));
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

