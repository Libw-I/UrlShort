document.addEventListener('DOMContentLoaded', () => {
    // 显示所有 cf-turnstile 元素
    document.querySelectorAll('.cf-turnstile').forEach(el => el.style.display = 'block');
    let loading = false;

    // 显示提示信息的函数
    const showAlert = (type, message) => {
        const alertEl = document.getElementById('alert');
        alertEl.className = type || '';
        alertEl.textContent = message;
    };

    const submitButton = document.getElementById('submit');
    submitButton.addEventListener('click', () => {
        if (loading) return; // 如果正在加载中，直接返回

        // 获取用户输入的数据
        const url = document.getElementById('url').value;
        const slug = document.getElementById('slug').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]').value;

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
        const body = {url, turnstileToken: turnstileResponse, slug, password, email};

        // 发送创建短链的请求
        fetch('/create', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
            .then(response => response.json())
            .then(res => {
                loading = false;
                submitButton.disabled = false; // 重新启用提交按钮
                submitButton.classList.remove('loading'); // 移除加载中的样式

                // 如果返回信息中包含错误，显示错误提示
                if (res.message && res.code !== 200) {
                    showAlert('error', res.message);
                    return;
                }

                // 成功返回短链接，更新输入框的值并选中链接
                document.getElementById('url').value = res.link;
                document.getElementById('url').select();
                showAlert('success', '完成，请复制下方的链接！');
            })
            .catch(err => {
                // 处理请求失败的情况
                let errorMsg = '抱歉，短链创建失败，请重试';
                if (err.status === 429) {
                    errorMsg = '操作速度过快，请稍后再试';
                } else if (err.response && err.response.message) {
                    errorMsg = err.response.message;
                }
                console.error('Error details:', err);
                showAlert('error', errorMsg);
                loading = false;
                submitButton.disabled = false; // 重新启用提交按钮
                submitButton.classList.remove('loading'); // 移除加载中的样式
            });
    });
});
