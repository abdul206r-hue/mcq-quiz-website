const questions = {
    AuditFramework: [
        // Placeholder for questions related to Audit Framework
    ],
    PlanningAndRiskAssessment: [
        // Placeholder for questions related to Planning and Risk Assessment
    ],
    InternalControls: [
        // Placeholder for questions related to Internal Controls
    ],
    AuditEvidence: [
        // Placeholder for questions related to Audit Evidence
    ],
    ReviewAndReporting: [
        // Placeholder for questions related to Review and Reporting
    ]
};

function getRandomQuiz(numQuestions) {
    const allQuestions = [...questions.AuditFramework, 
                          ...questions.PlanningAndRiskAssessment, 
                          ...questions.InternalControls, 
                          ...questions.AuditEvidence, 
                          ...questions.ReviewAndReporting];

    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numQuestions);
}

export { questions, getRandomQuiz };