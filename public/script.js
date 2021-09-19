const textInput = document.getElementById('textInput');
const chat = document.getElementById('chat');

const context = {};
let sessionId;

const createTemplateChatMessage = (data, from) => {
  const { title, text, options = [] } = data || {};
  const message = typeof data === 'string' ? data : (title || text);

  return `
  <div class="from-${from}">
    <div class="message-inner">
      <p>
        ${message}
        ${options.map(({ label }) => `
          <br>
            - ${label}
        `)}
      </p>
    </div>
  </div>
  `;
};

// Crate a Element and append to chat
const InsertTemplateInTheChat = (template) => {
  const div = document.createElement('div');
  div.innerHTML = template;

  chat.appendChild(div);
  chat.scrollTo({
    top: chat.scrollHeight,
  });
};

// Calling server and get the watson output
const getWatsonMessageAndInsertTemplate = async (text = '') => {
  const baseUrl = 'http://localhost:3000';

  if (!sessionId) {
    sessionId = await (await fetch(`${baseUrl}/session`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })).json().then(e => e.result.session_id);
  }


  const message = await (await fetch(`${baseUrl}/conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      context,
      sessionId,
    }),
  })).json().then(e => e.message);
  const template = createTemplateChatMessage(message, 'watson');
  InsertTemplateInTheChat(template);
};

textInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && textInput.value) {
    // Send the user message
    getWatsonMessageAndInsertTemplate(textInput.value);

    const template = createTemplateChatMessage(textInput.value, 'user');
    InsertTemplateInTheChat(template);

    // Clear input box for further messages
    textInput.value = '';
  }
});


getWatsonMessageAndInsertTemplate();
