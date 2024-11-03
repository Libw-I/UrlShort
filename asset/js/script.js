window.onload = () => {
    // 初始化变量和方法
    let loading = false;
    const submitButton = document.getElementById('submit'),
        CaptchaWidget = document.getElementById('bw-captcha-widget'),
        Captcha_Id = CaptchaWidget.getAttribute('id'),
        CaptchaKey = CaptchaWidget.getAttribute('bw-captcha-key'),
        showAlert = (type, message = '') => {
            const alertEl = document.getElementById('alert');
            alertEl.className = type || '';
            alertEl.textContent = message;
        };

    // 加载验证码
    if (CaptchaWidget && Captcha_Id && CaptchaKey) BW_Captcha(Captcha_Id, CaptchaKey, submitButton, showAlert)

    // 监听按钮点击
    submitButton.addEventListener('click', async () => {
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

        try {
            // 准备请求体数据
            const body = {url, turnstileToken: turnstile.getResponse(), slug, password, email};

            // 发送创建短链的请求
            const response = await fetch('/create', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body)
            });

            const res = await response.json();

            // 如果返回信息中包含错误，显示错误提示
            if (res.message && res.code !== 200) {
                showAlert('error', res.message);
                return;
            }

            // 成功返回短链接，更新输入框的值并选中链接
            document.getElementById('url').value = res.link;
            document.getElementById('url').select();
            showAlert('success', '完成, 请复制下方的链接！');
        } catch (err) {
            // 处理请求失败的情况
            let errorMsg = '抱歉, 短链创建失败, 请重试';
            if (err.status === 429) {
                errorMsg = '操作速度过快, 请稍后再试';
            } else if (err.response && err.response.message) {
                errorMsg = err.response.message;
            }
            console.error('Error details:', err);
            showAlert('error', errorMsg);
            turnstile.reset(_TurnstileWidgetId);
        } finally {
            // 无论请求成功或失败，确保清理操作执行
            loading = false;
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            turnstile.reset(_TurnstileWidgetId);
        }
    });
}