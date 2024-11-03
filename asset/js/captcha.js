const BW_Captcha = (div_id, site_key, submitButton, showAlert) => {
    if (!div_id || !site_key) return false;

    const updateButtonState = (disabled, loadingText) => {
        submitButton.disabled = disabled;
        submitButton.classList.toggle('loading', disabled);
        submitButton.textContent = loadingText;
    };

    const handleAlert = (type, message) => {
        if (showAlert) showAlert(type, message);
    };

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.onload = () => {
        updateButtonState(true, '正在验证您是否为机器人...');

        window._TurnstileWidgetId = turnstile.render('#' + div_id, {
            sitekey: site_key,
            retry: 'never',
            'refresh-expired': 'manual',
            'refresh-timeout': 'manual',
            'feedback-enabled': false,
            callback: () => {
                updateButtonState(false, '生成短链');
                handleAlert();
            },
            'error-callback': () => {
                updateButtonState(false, '请尝试刷新页面');
                handleAlert('error', '验证码在验证时出错, 请尝试刷新页面');
            },
            'expired-callback': () => {
                updateButtonState(false, '请重新通过验证码');
                handleAlert('error', '验证码的令牌已过期, 请重新验证');
            },
            'before-interactive-callback': () => {
                updateButtonState(true, '请通过验证码');
                handleAlert();
            },
            'unsupported-callback': () => {
                updateButtonState(false, '请更新浏览器后再来');
                handleAlert('error', '抱歉, 您的浏览器过旧, 请更新后再来');
            },
            'timeout-callback': () => {
                updateButtonState(false, '请尝试刷新页面');
                handleAlert('error', '验证码在验证中超时, 请尝试刷新页面');
            },
        });
    };
    document.head.appendChild(script);
    return true;
};
