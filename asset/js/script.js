document.addEventListener('DOMContentLoaded', () => {
    // 初始化变量
    let loading = false;
    const submitButton = document.getElementById('submit');

    // 初始化按钮
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    submitButton.textContent = '请等待验证码验证完成...';

    // 显示提示信息的函数
    const showAlert = (type, message) => {
        const alertEl = document.getElementById('alert');
        alertEl.className = type || '';
        alertEl.textContent = message;
    };

    // 渲染 Turnstile 小部件
    let widgetId = turnstile.render('#turnstile-widget', {
        sitekey: '0x4AAAAAAAylDH0pXEVAkn1K',
        'retry': 'never',
        'refresh-expired': 'manual',
        'refresh-timeout': 'manual',
        'feedback-enabled': 'false',
        callback: () => {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            submitButton.textContent = '生成短链';
        },
        'error-callback': () => {
            submitButton.classList.remove('loading');
            submitButton.textContent = '请尝试刷新页面';
            showAlert('error', '验证码在验证时出错, 请尝试刷新页面');
        },
        'expired-callback': () => {
            submitButton.classList.remove('loading');
            submitButton.textContent = '请重新通过验证码';
            showAlert('error', '验证码的令牌已过期, 请重新验证');
        },
        'unsupported-callback': () => {
            submitButton.classList.remove('loading');
            submitButton.textContent = '请更新浏览器后再来';
            showAlert('error', '抱歉, 您的浏览器过旧, 请更新后再来');
        },
        'timeout-callback': () => {
            submitButton.classList.remove('loading');
            submitButton.textContent = '请尝试刷新页面';
            showAlert('error', '验证码在验证中超时, 请尝试刷新页面');
        },
    });

    submitButton.addEventListener('click', () => {
        if (loading) return; // 如果正在加载中，直接返回

        if (!turnstile.getResponse()) {
            showAlert('error', '请完成验证码');
            return;
        }

        // 获取用户输入的数据
        const url = document.getElementById('url').value;
        const slug = document.getElementById('slug').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;

        // 检查 URL 是否填写
        if (!url) {
            showAlert('error', '请填写你要缩短的 URL');
            return;
        }
        // 检查 URL 格式是否正确
        if (!/^(https?):\/\/.{3,}/.test(url)) {
            showAlert('error', 'URL 格式不合规范');
            return;
        }

        // 清除提示信息
        showAlert(null, '');
        loading = true;
        submitButton.disabled = true; // 禁用提交按钮，防止重复提交
        submitButton.classList.add('loading'); // 添加加载中的样式

        // 准备请求体数据
        const body = {url, turnstileToken: turnstile.getResponse(), slug, password, email};

        // 发送创建短链的请求
        fetch('/create', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
            .then(response => response.json())
            .then(res => {
                loading = false;
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
                turnstile.reset(widgetId);

                // 如果返回信息中包含错误，显示错误提示
                if (res.message && res.code !== 200) {
                    showAlert('error', res.message);
                    return;
                }

                // 成功返回短链接，更新输入框的值并选中链接
                document.getElementById('url').value = res.link;
                document.getElementById('url').select();
                showAlert('success', '完成, 请复制下方的链接！');
            })
            .catch(err => {
                // 处理请求失败的情况
                let errorMsg = '抱歉, 短链创建失败, 请重试';
                if (err.status === 429) {
                    errorMsg = '操作速度过快, 请稍后再试';
                } else if (err.response && err.response.message) {
                    errorMsg = err.response.message;
                }
                console.error('Error details:', err);
                showAlert('error', errorMsg);
                loading = false;
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
                turnstile.reset(widgetId);
            });
    });
});
