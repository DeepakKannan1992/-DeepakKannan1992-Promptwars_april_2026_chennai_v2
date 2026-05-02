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
                fetchMessages(); // Refresh board
            }
        } catch (error) {
            console.error('Error posting message:', error);
            alert('Failed to post message. Please try again.');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    });

    async function fetchMessages() {
        try {
            const response = await fetch('/api/messages');
            const messages = await response.json();
            renderMessages(messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            board.innerHTML = '<div class="loader">Failed to load messages.</div>';
        }
    }

    function renderMessages(messages) {
        if (messages.length === 0) {
            board.innerHTML = '<div class="loader">No messages yet. Be the first to post!</div>';
            return;
        }

        board.innerHTML = '';
        messages.forEach((msg, index) => {
            const date = new Date(msg.timestamp);
            const formattedDate = date.toLocaleString();

            const card = document.createElement('div');
            card.className = 'message-card';
            card.style.animationDelay = `${index * 0.05}s`; // Staggered animation
            
            card.innerHTML = `
                <div class="message-header">
                    <span class="message-author">${escapeHtml(msg.author)}</span>
                    <span class="message-time">${formattedDate}</span>
                </div>
                <div class="message-text">${escapeHtml(msg.text).replace(/\n/g, '<br>')}</div>
            `;
            board.appendChild(card);
        });
    }

    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
});
