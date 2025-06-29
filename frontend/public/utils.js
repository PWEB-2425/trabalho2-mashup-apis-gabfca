export const utils = {
    showMessage: (message, type = 'error') => {
        const alertBox = document.createElement('div');
        alertBox.className = `message-box ${type}`;
        alertBox.textContent = message;
        document.body.appendChild(alertBox);
        
        setTimeout(() => {
            alertBox.classList.add('fade-out');
            setTimeout(() => alertBox.remove(), 500);
        }, 3000);
    },

    createYouTubeEmbed: (videoId, start = 0, autoplay = true) => {
        return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=1&controls=0&start=${Math.floor(start)}&enablejsapi=1`;
    },

    postToYouTubeIframe: (iframe, command, args = []) => {
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: command,
                args: args
            }), '*');
        }
    },

    formatTime: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    },

    debounce: (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    // Auth utility functions
    clearMessages: () => {
        if (elements.errorMsg) elements.errorMsg.textContent = '';
        if (elements.successMsg) elements.successMsg.textContent = '';
    },
    
    showError: (msg) => {
        if (elements.errorMsg) {
            elements.errorMsg.textContent = msg;
            if (elements.successMsg) elements.successMsg.textContent = '';
        }
    },
    
    showSuccess: (msg) => {
        if (elements.successMsg) {
            elements.successMsg.textContent = msg;
            if (elements.errorMsg) elements.errorMsg.textContent = '';
        }
    }
};
