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

  try {
    const formData = new FormData();
    formData.append('text', text);

    // Call correct.php backend
    const response = await fetch('correct.php', {
      method: 'POST',
      body: formData
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
    showError('Something went wrong: ' + err.message + '. Make sure XAMPP is running.');
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
