/* =============================================
   ACCA AA Exam Platform – script.js
   ============================================= */

// ---- State ----
const TOTAL_TIME = 2 * 60 * 60; // 2 hours in seconds

let questions        = [];
let currentIndex     = 0;
let userAnswers      = [];   // array of answer letter or null
let flagged          = [];   // Set-like boolean array
let timerInterval    = null;
let secondsRemaining = TOTAL_TIME;
let examStarted      = false;

// ---- Init ----
document.addEventListener('DOMContentLoaded', function () {
    initializeLocalStorage();
    questions = quizData.categories[0].questions;
    userAnswers = new Array(questions.length).fill(null);
    flagged     = new Array(questions.length).fill(false);
});

function initializeLocalStorage() {
    if (!localStorage.getItem('quizStats')) {
        localStorage.setItem('quizStats', JSON.stringify({
            totalQuizzes: 0,
            totalCorrect: 0,
            totalAttempted: 0,
            wrongAnswers: []
        }));
    }
}

// ============================================================
// Navigation helpers
// ============================================================
function showView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showHome() {
    stopTimer();
    showView('homePage');
}

function showStats() {
    stopTimer();
    displayStatistics();
    showView('statsPage');
}

// ============================================================
// EXAM
// ============================================================
function beginExam() {
    // Reset state
    questions    = quizData.categories[0].questions;
    userAnswers  = new Array(questions.length).fill(null);
    flagged      = new Array(questions.length).fill(false);
    currentIndex = 0;
    secondsRemaining = TOTAL_TIME;
    examStarted  = true;

    buildNavGrid();
    showView('examPage');
    displayQuestion();
    startTimer();
}

function displayQuestion() {
    const q     = questions[currentIndex];
    const total = questions.length;

    // Meta bar
    document.getElementById('questionLabel').textContent =
        `Question ${currentIndex + 1} of ${total}`;

    // Flag button state
    const flagBtn = document.getElementById('flagBtn');
    flagBtn.classList.toggle('active', flagged[currentIndex]);
    flagBtn.textContent = flagged[currentIndex] ? '🚩 Flagged' : '🚩 Flag';

    // Progress
    const answered = userAnswers.filter(a => a !== null).length;
    document.getElementById('progressFill').style.width =
        ((answered / total) * 100) + '%';
    document.getElementById('progressLabel').textContent =
        `${answered} / ${total}`;

    // Question HTML
    const letters = ['A', 'B', 'C', 'D'];
    let optHTML = '';
    q.options.forEach((opt, i) => {
        const letter  = letters[i];
        const selected = userAnswers[currentIndex] === letter ? 'selected' : '';
        optHTML += `
          <label class="option-label ${selected}" onclick="selectAnswer('${letter}', this)">
            <input type="radio" name="answer" value="${letter}"
              ${selected ? 'checked' : ''}>
            <span class="option-letter">${letter}</span>
            <span>${opt}</span>
          </label>`;
    });

    document.getElementById('questionContainer').innerHTML = `
      <p class="question-text">${q.question}</p>
      <div class="options-list">${optHTML}</div>`;

    // Nav grid
    updateNavGrid();

    // Prev/Next button states
    document.getElementById('prevBtn').disabled = currentIndex === 0;
    document.getElementById('nextBtn').textContent =
        currentIndex === total - 1 ? 'Review ▶' : 'Next ▶';
}

function selectAnswer(letter, labelEl) {
    userAnswers[currentIndex] = letter;

    // Update visual selection
    document.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
    labelEl.classList.add('selected');

    // Update progress & nav
    const total    = questions.length;
    const answered = userAnswers.filter(a => a !== null).length;
    document.getElementById('progressFill').style.width =
        ((answered / total) * 100) + '%';
    document.getElementById('progressLabel').textContent = `${answered} / ${total}`;
    updateNavGrid();
}

function nextQuestion() {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        displayQuestion();
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        displayQuestion();
    }
}

function toggleFlag() {
    flagged[currentIndex] = !flagged[currentIndex];
    const total   = flagged.filter(Boolean).length;
    document.getElementById('flagCount').textContent = `🚩 ${total} flagged`;
    displayQuestion(); // refresh flag button state & nav grid
}

// ---- Navigator grid ----
function buildNavGrid() {
    const grid = document.getElementById('questionNavGrid');
    grid.innerHTML = '';
    questions.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.textContent = i + 1;
        btn.onclick = () => { currentIndex = i; displayQuestion(); };
        grid.appendChild(btn);
    });
}

function updateNavGrid() {
    const btns = document.querySelectorAll('.nav-btn');
    btns.forEach((btn, i) => {
        btn.className = 'nav-btn';
        if (i === currentIndex)          btn.classList.add('current');
        if (flagged[i])                  btn.classList.add('flagged');
        if (userAnswers[i] !== null)     btn.classList.add('answered');
    });
}

// ---- Timer ----
function startTimer() {
    clearInterval(timerInterval);
    renderTimer();
    timerInterval = setInterval(() => {
        secondsRemaining--;
        renderTimer();
        if (secondsRemaining <= 0) {
            clearInterval(timerInterval);
            submitExam();
        }
    }, 1000);
}

function stopTimer() { clearInterval(timerInterval); }

function renderTimer() {
    const h  = Math.floor(secondsRemaining / 3600);
    const m  = Math.floor((secondsRemaining % 3600) / 60);
    const s  = secondsRemaining % 60;
    const el = document.getElementById('timerDisplay');
    el.textContent =
        String(h).padStart(2,'0') + ':' +
        String(m).padStart(2,'0') + ':' +
        String(s).padStart(2,'0');
    el.classList.remove('warning', 'danger');
    if (secondsRemaining <= 300)  el.classList.add('danger');
    else if (secondsRemaining <= 900) el.classList.add('warning');
}

// ---- Submit / Exit ----
function confirmSubmit() {
    const unanswered = userAnswers.filter(a => a === null).length;
    const msg = unanswered > 0
        ? `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`
        : 'Submit your exam?';
    if (confirm(msg)) submitExam();
}

function confirmExit() {
    if (confirm('Exit the exam? Your progress will be lost.')) {
        stopTimer();
        showHome();
    }
}

function submitExam() {
    stopTimer();
    calculateScore();
    showResults();
    showView('resultsPage');
}

// ============================================================
// RESULTS
// ============================================================
function calculateScore() {
    let correct = 0;
    const wrongList = [];
    questions.forEach((q, i) => {
        if (userAnswers[i] === q.correctAnswer) {
            correct++;
        } else {
            wrongList.push(q);
        }
    });

    // Persist stats
    const stats = JSON.parse(localStorage.getItem('quizStats'));
    stats.totalQuizzes++;
    stats.totalCorrect   += correct;
    stats.totalAttempted += questions.length;
    wrongList.forEach(q => {
        if (!stats.wrongAnswers.find(item => item.id === q.id)) {
            stats.wrongAnswers.push(q);
        }
    });
    localStorage.setItem('quizStats', JSON.stringify(stats));
    return correct;
}

function showResults() {
    const total   = questions.length;
    let correct   = 0;
    questions.forEach((q, i) => {
        if (userAnswers[i] === q.correctAnswer) correct++;
    });
    const pct = Math.round((correct / total) * 100);

    // Score ring
    document.getElementById('scorePercent').textContent = pct + '%';
    document.getElementById('scoreLabel').textContent   = `${correct} / ${total}`;
    // Animate ring: circumference = 2π×50 ≈ 314
    const offset = 314 - (314 * pct / 100);
    setTimeout(() => {
        document.getElementById('ringFill').style.strokeDashoffset = offset;
    }, 100);

    // Stats summary
    document.getElementById('scoreStats').innerHTML = `
      <div class="stat-row"><span class="stat-dot correct"></span><span>Correct: ${correct}</span></div>
      <div class="stat-row"><span class="stat-dot incorrect"></span><span>Incorrect: ${total - correct}</span></div>
      <div class="stat-row"><span class="stat-dot flagged"></span><span>Flagged: ${flagged.filter(Boolean).length}</span></div>
      <div class="stat-row"><span class="stat-dot" style="background:var(--gray-3)"></span>
        <span>Result: ${pct >= 50 ? '✅ Pass' : '❌ Fail'}</span></div>`;

    // Detailed review
    let html = '';
    questions.forEach((q, i) => {
        const ans       = userAnswers[i];
        const isCorrect = ans === q.correctAnswer;
        const correctOpt = q.options[q.correctAnswer.charCodeAt(0) - 65];
        html += `
          <div class="question-review ${isCorrect ? 'correct' : 'incorrect'}">
            <div class="q-num">Question ${i + 1} &mdash; ${q.difficulty}</div>
            <div class="q-text">${q.question}</div>
            <div class="ans-row">Your answer: <strong>${ans || '—'}</strong>
              ${isCorrect ? ' ✅' : ` ❌ &nbsp; Correct: <strong>${q.correctAnswer}. ${correctOpt}</strong>`}
            </div>
            <div class="explanation">${q.explanation}</div>
          </div>`;
    });
    document.getElementById('resultsSummary').innerHTML = html;
}

function retakeQuiz() {
    showView('examPage');
    beginExam();
}

// ============================================================
// STATISTICS
// ============================================================
function displayStatistics() {
    const stats = JSON.parse(localStorage.getItem('quizStats'));
    const accuracy = stats.totalAttempted > 0
        ? Math.round((stats.totalCorrect / stats.totalAttempted) * 100)
        : 0;

    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card"><h3>Exams Taken</h3><div class="stat-value">${stats.totalQuizzes}</div></div>
      <div class="stat-card"><h3>Total Correct</h3><div class="stat-value">${stats.totalCorrect}</div></div>
      <div class="stat-card"><h3>Total Attempted</h3><div class="stat-value">${stats.totalAttempted}</div></div>
      <div class="stat-card"><h3>Accuracy</h3><div class="stat-value">${accuracy}%</div></div>`;

    const list = document.getElementById('wrongAnswersList');
    if (stats.wrongAnswers && stats.wrongAnswers.length > 0) {
        list.innerHTML = `<h3>Questions to Review (${stats.wrongAnswers.length})</h3>`;
        stats.wrongAnswers.slice(0, 15).forEach(q => {
            const item = document.createElement('div');
            item.className = 'wrong-answer-item';
            item.innerHTML = `<strong>${q.question}</strong><p>${q.explanation}</p>`;
            list.appendChild(item);
        });
    } else {
        list.innerHTML = '<p>No wrong answers recorded yet. Keep practising!</p>';
    }
}

// ============================================================
// HELP
// ============================================================
function showHelp() {
    document.getElementById('helpModal').style.display = 'flex';
}
function closeHelp(event) {
    if (!event || event.target === document.getElementById('helpModal')) {
        document.getElementById('helpModal').style.display = 'none';
    }
}

