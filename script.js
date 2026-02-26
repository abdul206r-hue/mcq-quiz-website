// Global variables
let currentCategory = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    loadCategoriesHome();
    loadCaseStudies();
});

// Show/Hide Pages
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageName).classList.add('active');
}

function showHome() {
    showPage('homePage');
    updateNavLinks('home');
}

function showQuiz() {
    showPage('quizPage');
    updateNavLinks('quiz');
    loadCategories();
}

function showCaseStudy() {
    showPage('caseStudyPage');
    updateNavLinks('casestudy');
    loadCaseStudiesDisplay();
}

function updateNavLinks(active) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const links = document.querySelectorAll('.nav-link');
    if (active === 'home') links[0].classList.add('active');
    else if (active === 'quiz') links[1].classList.add('active');
    else if (active === 'casestudy') links[2].classList.add('active');
}

// Load Categories
function loadCategories() {
    const categoryGrid = document.getElementById('categoryGrid');
    categoryGrid.innerHTML = '';
    
    quizData.categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <h3>${category.name}</h3>
            <p>${category.questions.length} Questions</p>
            <button onclick="startQuiz(${category.id})" class="btn btn-primary">Start</button>
        `;
        categoryGrid.appendChild(categoryCard);
    });
}

function loadCategoriesHome() {
    // Load categories for home page if needed
    loadCategories();
}

// Start Quiz
function startQuiz(categoryId) {
    currentCategory = quizData.categories.find(cat => cat.id === categoryId);
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;
    
    document.getElementById('categorySelection').style.display = 'none';
    document.getElementById('quizQuestions').style.display = 'block';
    document.getElementById('categoryTitle').textContent = currentCategory.name;
    
    displayQuestion();
}

// Display Question
function displayQuestion() {
    const question = currentCategory.questions[currentQuestionIndex];
    const totalQuestions = currentCategory.questions.length;
    
    document.getElementById('questionCounter').textContent = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;
    
    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    const questionContainer = document.getElementById('questionContainer');
    questionContainer.innerHTML = `
        <div class="question-card">
            <h3>${question.question}</h3>
            <div class="options-list">
                ${question.options.map((option, index) => `
                    <label class="option-label">
                        <input type="radio" name="answer" value="${String.fromCharCode(65 + index)}" onchange="selectAnswer('${String.fromCharCode(65 + index)}')">
                        <span>${String.fromCharCode(65 + index)}. ${option}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
}

// Select Answer
function selectAnswer(answer) {
    userAnswers[currentQuestionIndex] = answer;
}

// Next Question
function nextQuestion() {
    if (userAnswers[currentQuestionIndex] === undefined) {
        alert('Please select an answer!');
        return;
    }
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentCategory.questions.length) {
        displayQuestion();
    } else {
        calculateScore();
        showResults();
    }
}

// Go Back to Categories
function goBack() {
    document.getElementById('quizQuestions').style.display = 'none';
    document.getElementById('categorySelection').style.display = 'block';
    currentQuestionIndex = 0;
    userAnswers = [];
}

// Calculate Score
function calculateScore() {
    score = 0;
    currentCategory.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
            score++;
        }
    });
}

// Show Results
function showResults() {
    document.getElementById('quizQuestions').style.display = 'none';
    document.getElementById('resultsPage').style.display = 'block';
    
    const totalQuestions = currentCategory.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    document.getElementById('finalScore').textContent = percentage;
    
    let summary = `<h3>Your Score: ${score} out of ${totalQuestions}</h3>`;
    summary += '<div class="answer-review">';
    
    currentCategory.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        const answerLetter = userAnswer || 'Not answered';
        const correctLetter = question.correctAnswer;
        
        summary += `
            <div class="question-review ${isCorrect ? 'correct' : 'incorrect'}">
                <p><strong>Q${index + 1}: ${question.question}</strong></p>
                <p>Your answer: <strong>${answerLetter}</strong> - ${isCorrect ? '✓ Correct' : '✗ Incorrect'}</p>
                ${!isCorrect ? `<p>Correct answer: <strong>${correctLetter}</strong></p>` : ''}
                <p class="explanation"><em>${question.explanation}</em></p>
            </div>
        `;
    });
    
    summary += '</div>';
    document.getElementById('resultsSummary').innerHTML = summary;
}

// Retake Quiz
function retakeQuiz() {
    document.getElementById('resultsPage').style.display = 'none';
    document.getElementById('categorySelection').style.display = 'block';
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;
}

// Load Case Studies
function loadCaseStudies() {
    // Initialize case studies
}

function loadCaseStudiesDisplay() {
    const caseStudiesGrid = document.getElementById('caseStudiesGrid');
    caseStudiesGrid.innerHTML = '';
    
    quizData.caseStudies.forEach(caseStudy => {
        const caseCard = document.createElement('div');
        caseCard.className = 'case-study-card';
        caseCard.innerHTML = `
            <h3>${caseStudy.title}</h3>
            <p>${caseStudy.description}</p>
            <p class="date">${new Date(caseStudy.date).toLocaleDateString()}</p>
            <button onclick="viewCaseStudy(${caseStudy.id})" class="btn btn-primary">Read More</button>
        `;
        caseStudiesGrid.appendChild(caseCard);
    });
}

function viewCaseStudy(caseStudyId) {
    const caseStudy = quizData.caseStudies.find(cs => cs.id === caseStudyId);
    const caseContainer = document.querySelector('.case-study-container');
    
    caseContainer.innerHTML = `
        <div class="case-study-detail">
            <button onclick="loadCaseStudiesDisplay()" class="btn btn-secondary">Back</button>
            <h2>${caseStudy.title}</h2>
            <p class="date">${new Date(caseStudy.date).toLocaleDateString()}</p>
            <div class="case-content">
                <p>${caseStudy.content}</p>
            </div>
        </div>
    `;
}