let currentCategory = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;
let questionsToShow = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeLocalStorage();
    loadCategoriesHome();
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

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageName).classList.add('active');
}

function showHome() { showPage('homePage'); updateNavLinks(0); }
function showQuiz() { showPage('quizPage'); updateNavLinks(1); loadCategories(); }
function showStats() { showPage('statsPage'); updateNavLinks(2); displayStatistics(); }

function updateNavLinks(index) {
    document.querySelectorAll('.nav-link').forEach((link, i) => {
        link.classList.toggle('active', i === index);
    });
}

function loadCategoriesHome() {}

function loadCategories() {
    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = '';
    quizData.categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `<h3>${cat.name}</h3><p>${cat.questions.length} Questions</p><button onclick="startQuiz(${cat.id})" class="btn btn-primary">Start</button>`;
        grid.appendChild(card);
    });
}

function startQuiz(categoryId) {
    currentCategory = quizData.categories.find(cat => cat.id === categoryId);
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;
    questionsToShow = [...currentCategory.questions];
    
    document.getElementById('categorySelection').style.display = 'none';
    document.getElementById('quizQuestions').style.display = 'block';
    document.getElementById('resultsPage').style.display = 'none';
    document.getElementById('categoryTitle').textContent = currentCategory.name;
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex >= questionsToShow.length) {
        calculateScore();
        showResults();
        return;
    }

    const q = questionsToShow[currentQuestionIndex];
    const total = questionsToShow.length;
    document.getElementById('questionCounter').textContent = `Q${currentQuestionIndex + 1}/${total}`;
    
    const progress = ((currentQuestionIndex + 1) / total) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    const container = document.getElementById('questionContainer');
    container.innerHTML = `<div class="question-card"><h3>${q.question}</h3><div class="options-list">${q.options.map((opt, i) => `<label class="option-label"><input type="radio" name="answer" value="${String.fromCharCode(65+i)}" onchange="selectAnswer('${String.fromCharCode(65+i)}')"><span>${String.fromCharCode(65+i)}. ${opt}</span></label>`).join('')}</div></div>`;
}

function selectAnswer(ans) { 
    userAnswers[currentQuestionIndex] = ans; 
}

function nextQuestion() {
    if (userAnswers[currentQuestionIndex] === undefined) {
        alert('Please select an answer!');
        return;
    }
    currentQuestionIndex++;
    displayQuestion();
}

function goBack() {
    document.getElementById('quizQuestions').style.display = 'none';
    document.getElementById('categorySelection').style.display = 'block';
    currentQuestionIndex = 0;
    userAnswers = [];
    loadCategories();
}

function calculateScore() {
    score = 0;
    let wrongAnswers = [];
    questionsToShow.forEach((q, i) => {
        if (userAnswers[i] === q.correctAnswer) {
            score++;
        } else {
            wrongAnswers.push(q);
        }
    });
    
    const stats = JSON.parse(localStorage.getItem('quizStats'));
    stats.totalQuizzes++;
    stats.totalCorrect += score;
    stats.totalAttempted += questionsToShow.length;
    wrongAnswers.forEach(q => {
        if (!stats.wrongAnswers.find(item => item.id === q.id)) {
            stats.wrongAnswers.push(q);
        }
    });
    localStorage.setItem('quizStats', JSON.stringify(stats));
}

function showResults() {
    document.getElementById('quizQuestions').style.display = 'none';
    document.getElementById('resultsPage').style.display = 'block';
    
    const total = questionsToShow.length;
    const pct = Math.round((score / total) * 100);
    document.getElementById('finalScore').textContent = pct;
    
    let summary = `<h3>Score: ${score}/${total}</h3><div class="answer-review">`;
    questionsToShow.forEach((q, i) => {
        const ans = userAnswers[i];
        const correct = ans === q.correctAnswer;
        const correctOpt = q.options[q.correctAnswer.charCodeAt(0) - 65];
        summary += `<div class="question-review ${correct?'correct':'incorrect'}"><p><strong>Q${i+1}: ${q.question}</strong></p><p>Your: <strong>${ans||'?'}</strong> - ${correct?'✓':'✗'}</p>${!correct?`<p>Correct: <strong>${q.correctAnswer}. ${correctOpt}</strong></p>`:''}<p class="explanation"><em>${q.explanation}</em></p></div>`;
    });
    summary += '</div>';
    document.getElementById('resultsSummary').innerHTML = summary;
}

function retakeQuiz() {
    document.getElementById('resultsPage').style.display = 'none';
    document.getElementById('categorySelection').style.display = 'block';
    loadCategories();
}

function displayStatistics() {
    const stats = JSON.parse(localStorage.getItem('quizStats'));
    const grid = document.getElementById('statsGrid');
    grid.innerHTML = `<div class="stat-card"><h3>Total Quizzes</h3><div class="stat-value">${stats.totalQuizzes}</div></div><div class="stat-card"><h3>Correct</h3><div class="stat-value">${stats.totalCorrect}</div></div><div class="stat-card"><h3>Accuracy</h3><div class="stat-value">${stats.totalAttempted>0?Math.round((stats.totalCorrect/stats.totalAttempted)*100):0}%</div></div>`;
    
    const list = document.getElementById('wrongAnswersList');
    if (stats.wrongAnswers && stats.wrongAnswers.length > 0) {
        list.innerHTML = '';
        stats.wrongAnswers.slice(0, 10).forEach(q => {
            const item = document.createElement('div');
            item.className = 'wrong-answer-item';
            item.innerHTML = `<strong>${q.question}</strong><p>${q.explanation}</p>`;
            list.appendChild(item);
        });
    } else {
        list.innerHTML = '<p>No wrong answers yet. Keep practicing!</p>';
    }
}
