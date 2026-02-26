// mcq-quiz.js

// Array to hold quiz questions
const quizQuestions = [
    {
        question: "What is the capital of France?",
        options: ["Berlin", "Madrid", "Paris", "Lisbon"],
        answer: "Paris"
    },
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        answer: "4"
    },
    // Add more questions as needed
];

// Function to display categories and start quiz
function displayCategories() {
    const categories = ["Science", "Math", "History", "Geography"];
    categories.forEach(category => {
        console.log(`Category: ${category}`);
    });
    // Logic to select category and start quiz
}

// Function to render quiz questions
function renderQuiz() {
    quizQuestions.forEach((question, index) => {
        console.log(`${index + 1}. ${question.question}`);
        question.options.forEach(option => {
            console.log(`- ${option}`);
        });
    });
}

// Function to calculate results
function calculateResults(userAnswers) {
    let score = 0;
    userAnswers.forEach((answer, index) => {
        if (answer === quizQuestions[index].answer) {
            score++;
        }
    });
    return score;
}

// Main function to trigger quiz functionality
function startQuiz() {
    displayCategories();
    renderQuiz();
    // Logic to collect user answers and calculate results
}

startQuiz();
