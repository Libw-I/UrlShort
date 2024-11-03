window.onload = () => {
    const operationSelect = document.getElementById('operation');
    const newUrlGroup = document.getElementById('newUrlGroup');
    const newSlugGroup = document.getElementById('newSlugGroup');
    const newPasswordGroup = document.getElementById('newPasswordGroup');
    const apiForm = document.getElementById('apiForm');
    const resultDiv = document.getElementById('result');
    const submitButton = document.getElementById('submit');
    const CaptchaWidget = document.getElementById('bw-captcha-widget');
    const Captcha_Id = CaptchaWidget.getAttribute('id');
    const CaptchaKey = CaptchaWidget.getAttribute('bw-captcha-key');

    // 加载验证码
    if (CaptchaWidget && Captcha_Id && CaptchaKey) {
        BW_Captcha(Captcha_Id, CaptchaKey, submitButton);
    }

    // 根据选择的操作显示对应的输入组
    const toggleGroups = () => {
        newUrlGroup.style.display = 'none';
        newSlugGroup.style.display = 'none';
        newPasswordGroup.style.display = 'none';

        const groups = {
            'update-url': newUrlGroup,
            'update-slug': newSlugGroup,
            'update-password': newPasswordGroup
        };

        const selectedGroup = groups[operationSelect.value];
        if (selectedGroup) {
            selectedGroup.style.display = 'block';
        }
    };

    // 监听操作选择框的变化事件
    operationSelect.addEventListener('change', toggleGroups);

    // 监听表单提交事件
    apiForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true; // 禁用提交按钮

        const turnstileToken = document.querySelector('[name="cf-turnstile-response"]').value;
        const slug = document.getElementById('slug').value;

        if (!slug) {
            resultDiv.innerHTML = `<div class="errorAlert" role="alert">请填写你要管理的Slug</div>`;
            submitButton.disabled = false;
            return;
        }

        const requestData = {
            operation: operationSelect.value,
            slug,
            turnstileToken
        };

        // 根据操作类型添加对应的额外数据
        if (requestData.operation === 'update-url') {
            requestData.newUrl = document.getElementById('newUrl').value;
        } else if (requestData.operation === 'update-slug') {
            requestData.newSlug = document.getElementById('newSlug').value;
        } else if (requestData.operation === 'update-password') {
            requestData.newPassword = document.getElementById('newPassword').value;
        }

        try {
            const response = await fetch('/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const responseData = await response.json();
            resultDiv.innerHTML = `<div class="${response.ok ? 'alert' : 'errorAlert'}" role="alert">${responseData.message}</div>`;
        } catch (error) {
            console.error('Error details:', error);
            resultDiv.innerHTML = `<div class="errorAlert" role="alert">请求失败，请稍后重试</div>`;
        } finally {
            submitButton.disabled = false; // 恢复提交按钮
            turnstile.reset(_TurnstileWidgetId);
        }
    });
};
