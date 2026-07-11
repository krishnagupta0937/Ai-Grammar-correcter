// ============================================================
//  AI Grammar Corrector — Frontend Logic (script.js)
// ============================================================

// ---- DOM Element References ----
const inputText     = document.getElementById('inputText');
const correctBtn    = document.getElementById('correctBtn');
const loadingState  = document.getElementById('loadingState');
const errorAlert    = document.getElementById('errorAlert');
const errorMsg      = document.getElementById('errorMsg');
const resultSection = document.getElementById('resultSection');
const correctedText = document.getElementById('correctedText');

// ---- Show / Hide helpers ----
function showElement(el)  { el.classList.remove('d-none'); }
function hideElement(el)  { el.classList.add('d-none'); }

function showError(msg) {
  errorMsg.textContent = msg;
  showElement(errorAlert);
}

function hideError() {
  hideElement(errorAlert);
}

// ---- Main: Correct Grammar ----
async function correctGrammar() {
  const text = inputText.value.trim();

  if (!text) {
    showError('Please enter some text before clicking Correct Grammar.');
    return;
  }

  // Reset UI states
  hideElement(resultSection);
  hideElement(loadingState);
  hideError();
  showElement(loadingState);
  correctBtn.disabled = true;
  correctBtn.textContent = 'Correcting...';

  const isLocalXampp = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const backendUrl = isLocalXampp ? 'correct.php' : 'api/correct';

  try {
    // Send post data as application/x-www-form-urlencoded
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ text: text })
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    hideElement(loadingState);

    if (data.error) {
      showError(data.error);
      return;
    }

    // Display result in read-only dialog box
    correctedText.value = data.corrected;
    showElement(resultSection);

  } catch (err) {
    hideElement(loadingState);
    const extraHelp = isLocalXampp ? '. Make sure XAMPP is running.' : '';
    showError('Something went wrong: ' + err.message + extraHelp);
  } finally {
    correctBtn.disabled = false;
    correctBtn.textContent = 'Correct Grammar';
  }
}

// ---- Event Listeners ----
correctBtn.addEventListener('click', correctGrammar);

// Allow Ctrl+Enter inside input textarea to trigger correction
inputText.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    correctGrammar();
  }
});
