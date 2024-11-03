window.onload = () => {
    let loading = false;
    const submitButton = document.getElementById('submit');
    const CaptchaWidget = document.getElementById('bw-captcha-widget');
    const Captcha_Id = CaptchaWidget.getAttribute('id');
    const CaptchaKey = CaptchaWidget.getAttribute('bw-captcha-key');

    const showAlert = (type, message = '') => {
        const alertEl = document.getElementById('alert');
        alertEl.className = type || '';
        alertEl.textContent = message;
    };

    // 加载验证码
    if (CaptchaWidget && Captcha_Id && CaptchaKey) {
        BW_Captcha(Captcha_Id, CaptchaKey, submitButton, showAlert);
    }

    // 监听按钮点击
    submitButton.addEventListener('click', async () => {
        if (loading) return;

        if (!turnstile.getResponse()) {
            showAlert('error', '请完成验证码');
            return;
        }

        const url = document.getElementById('url').value;
        if (!url) {
            showAlert('error', '请填写你要缩短的 URL');
            return;
        }
        if (!/^(https?):\/\/.{3,}/.test(url)) {
            showAlert('error', 'URL 格式不合规范');
            return;
        }

        // 清除提示信息并准备加载状态
        showAlert(null, '');
        loading = true;
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        submitButton.textContent = '正在缩短中...';

        try {
            const body = {
                url,
                turnstileToken: turnstile.getResponse(),
                slug: document.getElementById('slug').value,
                password: document.getElementById('password').value,
                email: document.getElementById('email').value
            };

            const response = await fetch('/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const res = await response.json();

            if (res.message && res.code !== 200) {
                showAlert('error', res.message);
            } else {
                document.getElementById('url').value = res.link;
                document.getElementById('url').select();
                showAlert('success', '完成, 请复制下方的链接！');
            }
        } catch (err) {
            let errorMsg = '抱歉, 短链创建失败, 请重试';
            if (err.status === 429) {
                errorMsg = '操作速度过快, 请稍后再试!';
            }
            showAlert('error', errorMsg);
        } finally {
            turnstile.reset(_TurnstileWidgetId);
        }
        loading = false;
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        submitButton.textContent = '生成短链';
    });
};
