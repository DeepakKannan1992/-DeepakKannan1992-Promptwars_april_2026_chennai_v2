/**
 * Initializes the frontend logic for the Team Board application.
 */
document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const form = document.getElementById('post-form');
    const authorInput = document.getElementById('author-input');
    const messageInput = document.getElementById('message-input');

    // Fetch messages on load
    fetchMessages();

    // Setup form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const author = authorInput.value.trim();
        const text = messageInput.value.trim();
        
        if (!author || !text) return;

        const button = form.querySelector('button');
        const originalText = button.textContent;
        button.textContent = 'Posting...';
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ author, text })
            });

            if (response.ok) {
                messageInput.value = '';
                fetchMessages(); // Refresh board securely
            } else {
                throw new Error('Server rejected the message');
            }
        } catch (error) {
            console.error('Error posting message:', error);
            alert('Failed to post message. Please try again.');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
            button.removeAttribute('aria-busy');
        }
    });

    /**
     * Fetches messages from the API and renders them.
     */
    async function fetchMessages() {
        try {
            const response = await fetch('/api/messages');
            if (!response.ok) throw new Error('Network response was not ok');
            const messages = await response.json();
            renderMessages(messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            board.innerHTML = '<div class="loader" role="alert">Failed to load messages.</div>';
        }
    }

    /**
     * Renders messages to the DOM.
     * @param {Array} messages - The messages array
     */
    function renderMessages(messages) {
        if (!Array.isArray(messages) || messages.length === 0) {
            board.innerHTML = '<div class="loader">No messages yet. Be the first to post!</div>';
            return;
        }

        board.innerHTML = '';
        messages.forEach((msg, index) => {
            const date = new Date(msg.timestamp);
            const formattedDate = date.toLocaleString();

            const card = document.createElement('article');
            card.className = 'message-card';
            card.style.animationDelay = `${index * 0.05}s`;
            
            card.innerHTML = `
                <div class="message-header">
                    <span class="message-author">${escapeHtml(msg.author)}</span>
                    <time class="message-time" datetime="${date.toISOString()}">${formattedDate}</time>
                </div>
                <div class="message-text">${escapeHtml(msg.text).replace(/\n/g, '<br>')}</div>
            `;
            board.appendChild(card);
        });
    }

    /**
     * Escapes unsafe HTML characters to prevent XSS attacks.
     * @param {string} unsafe - The raw user input
     * @returns {string} The escaped safe HTML string
     */
    function escapeHtml(unsafe) {
        return String(unsafe)
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
});
