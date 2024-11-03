window.onload = () => {
    // 获取操作选择框和相关的输入组元素
    const operationSelect = document.getElementById('operation'),
        newUrlGroup = document.getElementById('newUrlGroup'),
        newSlugGroup = document.getElementById('newSlugGroup'),
        newPasswordGroup = document.getElementById('newPasswordGroup'),
        apiForm = document.getElementById('apiForm'),
        resultDiv = document.getElementById('result'),
        submitButton = document.getElementById('submit'),
        CaptchaWidget = document.getElementById('bw-captcha-widget'),
        Captcha_Id = CaptchaWidget.getAttribute('id'),
        CaptchaKey = CaptchaWidget.getAttribute('bw-captcha-key');

    // 加载验证码
    if (CaptchaWidget && Captcha_Id && CaptchaKey) BW_Captcha(Captcha_Id, CaptchaKey, submitButton);

    // 根据选择的操作显示对应的输入组
    const toggleGroups = () => {
        newUrlGroup.style.display = 'none';
        newSlugGroup.style.display = 'none';
        newPasswordGroup.style.display = 'none';

        switch (operationSelect.value) {
            case 'update-url':
                newUrlGroup.style.display = 'block';
                break;
            case 'update-slug':
                newSlugGroup.style.display = 'block';
                break;
            case 'update-password':
                newPasswordGroup.style.display = 'block';
                break;
        }
    };

    // 监听操作选择框的变化事件
    operationSelect.addEventListener('change', toggleGroups);

    // 监听表单提交事件
    apiForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // 获取验证码令牌
        const turnstileToken = document.querySelector('[name="cf-turnstile-response"]').value;
        submitButton.disabled = true; // 禁用提交按钮，防止重复提交

        // 构建请求数据
        const requestData = {
            operation: operationSelect.value,
            slug: document.getElementById('slug').value,
            password: document.getElementById('password').value,
            turnstileToken
        };

        // 检查是否填写了 slug
        if (!requestData.slug) {
            resultDiv.innerHTML = `<div class="errorAlert" role="alert">请填写你要管理的Slug</div>`;
            submitButton.disabled = false;
            return;
        }

        // 根据操作类型添加对应的额外数据
        switch (requestData.operation) {
            case 'update-url':
                requestData.newUrl = document.getElementById('newUrl').value;
                break;
            case 'update-slug':
                requestData.newSlug = document.getElementById('newSlug').value;
                break;
            case 'update-password':
                requestData.newPassword = document.getElementById('newPassword').value;
                break;
        }

        try {
            // 发送请求到服务器
            const response = await fetch('/admin', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestData)
            });

            const responseData = await response.json();
            // 根据响应状态显示对应的提示信息
            resultDiv.innerHTML = `<div class="${response.ok ? 'alert' : 'errorAlert'}" role="alert">${responseData.message}</div>`;
        } catch (error) {
            // 处理请求失败的情况
            console.error('Error details:', err);
            resultDiv.innerHTML = `<div class="errorAlert" role="alert">请求失败，请稍后重试</div>`;
            turnstile.reset(_TurnstileWidgetId);
        } finally {
            submitButton.disabled = false; // 恢复提交按钮
            turnstile.reset(_TurnstileWidgetId);
        }
    });
};
