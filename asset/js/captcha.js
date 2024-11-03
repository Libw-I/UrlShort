const BW_Captcha = (div_id, site_key, submitButton = undefined, showAlert = undefined) => {
    if (!div_id || !site_key) return;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.onload = () => {
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        submitButton.textContent = '正在验证您是否为机器人...';
        // 显示验证码
        window._TurnstileWidgetId = turnstile.render('#' + div_id, {
            'sitekey': site_key,
            'retry': 'never',
            'refresh-expired': 'manual',
            'refresh-timeout': 'manual',
            'feedback-enabled': 'false',
            'callback': () => {
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
                submitButton.textContent = '生成短链';
                if (showAlert) showAlert();
            },
            'error-callback': () => {
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
                submitButton.textContent = '请尝试刷新页面';
                if (showAlert) showAlert('error', '验证码在验证时出错, 请尝试刷新页面');
            },
            'expired-callback': () => {
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
                submitButton.textContent = '请重新通过验证码';
                if (showAlert) showAlert('error', '验证码的令牌已过期, 请重新验证');
            },
            'before-interactive-callback': () => {
                submitButton.disabled = true;
                submitButton.classList.add('loading');
                submitButton.textContent = '请通过验证码';
                if (showAlert) showAlert();
            },
            'unsupported-callback': () => {
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
                submitButton.textContent = '请更新浏览器后再来';
                if (showAlert) showAlert('error', '抱歉, 您的浏览器过旧, 请更新后再来');
            },
            'timeout-callback': () => {
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
                submitButton.textContent = '请尝试刷新页面';
                if (showAlert) showAlert('error', '验证码在验证中超时, 请尝试刷新页面');
            },
        });
    };
    document.head.appendChild(script);
}