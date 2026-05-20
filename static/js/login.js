document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('#id_password');
    const eyeIcon = document.querySelector('#eyeIcon');
    const eyeText = document.querySelector('#eyeText');

    if (!togglePassword || !password || !eyeIcon || !eyeText) {
        return;
    }

    togglePassword.addEventListener('click', function () {
        const isPassword = password.getAttribute('type') === 'password';
        password.setAttribute('type', isPassword ? 'text' : 'password');

        if (isPassword) {
            eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
            eyeText.textContent = 'Ocultar';
            togglePassword.setAttribute('aria-label', 'Ocultar senha');
        } else {
            eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
            eyeText.textContent = 'Exibir';
            togglePassword.setAttribute('aria-label', 'Mostrar senha');
        }
    });
});
