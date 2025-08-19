// 全局变量
let isLoading = false;
let conversationHistory = [];

// DOM 元素
const promptInput = document.getElementById('prompt');
const sendBtn = document.getElementById('sendBtn');
const historyDiv = document.getElementById('history');
const statusDiv = document.getElementById('out');
const themeToggle = document.getElementById('theme-toggle');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // 设置主题
    initializeTheme();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 自动调整输入框高度
    autoResizeTextarea();
    
    // 显示欢迎消息
    showWelcomeMessage();
}

// 主题管理
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    }
}

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

// 事件监听器
function bindEventListeners() {
    // 主题切换
    themeToggle?.addEventListener('click', toggleTheme);
    
    // 发送按钮
    sendBtn?.addEventListener('click', send);
    
    // 输入框事件
    promptInput?.addEventListener('input', handleInputChange);
    promptInput?.addEventListener('keydown', handleKeyDown);
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    });
}

// 输入处理
function handleInputChange() {
    const hasContent = promptInput.value.trim().length > 0;
    sendBtn.disabled = !hasContent || isLoading;
    
    // 自动调整高度
    autoResizeTextarea();
}

function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) {
            send();
        }
    }
}

function autoResizeTextarea() {
    promptInput.style.height = 'auto';
    promptInput.style.height = Math.min(promptInput.scrollHeight, 200) + 'px';
}

// 消息发送
async function send() {
    const message = promptInput.value.trim();
    if (!message || isLoading) return;
    
    // 添加用户消息
    addMessage(message, 'user');
    
    // 清空输入框
    promptInput.value = '';
    handleInputChange();
    
    // 设置加载状态
    setLoading(true);
    
    // 显示打字指示器
    const typingId = showTypingIndicator();
    
    try {
        // 发送请求
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: conversationHistory
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 移除打字指示器
        removeTypingIndicator(typingId);
        
        // 添加助手回复
        addMessage(data.response, 'assistant');
        
        // 更新对话历史
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: data.response }
        );
        
    } catch (error) {
        console.error('Error:', error);
        
        // 移除打字指示器
        removeTypingIndicator(typingId);
        
        // 显示错误消息
        addMessage('抱歉，发生了错误。请稍后再试。', 'assistant', true);
        
        // 显示状态
        showStatus('发送失败: ' + error.message, 'error');
    } finally {
        setLoading(false);
    }
}

// 消息管理
function addMessage(content, role, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? '我' : 'AI';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (isError) {
        contentDiv.style.background = '#fee2e2';
        contentDiv.style.color = '#dc2626';
        contentDiv.style.borderColor = '#fecaca';
    }
    
    // 处理 Markdown 和代码块
    contentDiv.innerHTML = formatMessage(content);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    
    historyDiv.appendChild(messageDiv);
    
    // 滚动到底部
    scrollToBottom();
}

function formatMessage(content) {
    // 简单的 Markdown 处理
    let formatted = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    
    // 处理代码块
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    return formatted;
}

function showTypingIndicator() {
    const typingId = 'typing-' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    messageDiv.id = typingId;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'AI';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    contentDiv.appendChild(typingDiv);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    
    historyDiv.appendChild(messageDiv);
    scrollToBottom();
    
    return typingId;
}

function removeTypingIndicator(typingId) {
    const typingElement = document.getElementById(typingId);
    if (typingElement) {
        typingElement.remove();
    }
}

function scrollToBottom() {
    historyDiv.scrollTop = historyDiv.scrollHeight;
}

// 状态管理
function setLoading(loading) {
    isLoading = loading;
    sendBtn.disabled = loading || !promptInput.value.trim();
    
    if (loading) {
        sendBtn.classList.add('send-button-loading');
    } else {
        sendBtn.classList.remove('send-button-loading');
    }
}

function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    
    if (type === 'error') {
        statusDiv.style.background = '#dc2626';
    } else {
        statusDiv.style.background = 'rgba(17, 24, 39, 0.9)';
    }
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// 新建对话
function newChat() {
    conversationHistory = [];
    historyDiv.innerHTML = '';
    showWelcomeMessage();
    promptInput.focus();
}

function showWelcomeMessage() {
    addMessage('你好！我是 FindX AI，一个智能对话助手。有什么我可以帮助你的吗？', 'assistant');
}

// 工具函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}