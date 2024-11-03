const BW_Captcha = (div_id, site_key, submitButton, showAlert) => {
    if (!div_id || !site_key) return false;

    const updateButtonState = (disabled, loadingStatus, loadingText) => {
        submitButton.disabled = disabled;
        submitButton.classList.toggle('loading', loadingStatus);
        submitButton.textContent = loadingText;
    };

    const handleAlert = (type, message) => {
        if (showAlert) showAlert(type, message);
    };

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.onload = () => {
        updateButtonState(true, true, '正在验证您是否为机器人...');
        turnstile.render('#' + div_id, {
            sitekey: site_key,
            retry: 'never',
            'refresh-expired': 'manual',
            'refresh-timeout': 'manual',
            'feedback-enabled': false,
            callback: () => {
                updateButtonState(false, false, '生成短链');
                setTimeout(() => {
                    handleAlert()
                }, 5000);
            },
            'error-callback': () => {
                updateButtonState(true, false, '请尝试刷新页面');
                handleAlert('error', '验证码验证出错');
            },
            'expired-callback': () => {
                updateButtonState(true, false, '请重新尝试验证码');
                handleAlert('error', '验证码的令牌已过期');
            },
            'before-interactive-callback': () => {
                updateButtonState(true, true, '请通过验证码');
            },
            'unsupported-callback': () => {
                updateButtonState(true, false, '请更新浏览器后再来');
                handleAlert('error', '抱歉, 您的浏览器过旧');
            },
            'timeout-callback': () => {
                updateButtonState(true, false, '请确保浏览器环境正常后重新尝试验证码');
                handleAlert('error', '验证码验证超时');
            },
        });
    };
    document.head.appendChild(script);
    return true;
};
