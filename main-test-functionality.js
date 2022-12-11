async function testOperations() {
    let questionObj = await getTestQuestions();
    // prepare view - change buttons panel + clear questions field
    let manipulation = new Test(questionObj, 5);
    document.getElementsByClassName('quiz-buttons__next')[0].onclick = manipulation.nextQuestion.bind(manipulation);
    document.getElementsByClassName('quiz-buttons__prev')[0].onclick = manipulation.prevQuestion.bind(manipulation);
    document.getElementsByClassName('quiz-buttons__finish')[0].onclick = manipulation.checkAnswers.bind(manipulation);

}

async function getTestQuestions() {
    return await fetch('questions.json', {
        method: "GET"
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
    }).then(questionObj => {
        return questionObj;
    });
}

class Test {
    constructor(questionObj, count) {
        this.shuffledQuestions = questionObj.questions.sort(function () {
            return Math.random() - 0.5;
        });
        this.maxQuestionsCount = count;
        this.currentId = 0;
        this.currentAnswers = Array(count);
        this.currentAnswers.fill(null, 0, count);
        this.#removeQuestion();
        this.#showQuestion(this.shuffledQuestions[this.currentId]);
    }

    nextQuestion() {
        if (this.currentId === this.maxQuestionsCount - 1) {
            return;
        }
        this.#saveCurrentAnswer();
        this.#removeQuestion();
        this.currentId++;
        this.#showQuestion(this.shuffledQuestions[this.currentId]);
    }

    prevQuestion() {
        if (this.currentId === 0) {
            return;
        }
        this.#saveCurrentAnswer();
        this.#removeQuestion();
        this.currentId--;
        this.#showQuestion(this.shuffledQuestions[this.currentId]);
    }

    checkAnswers() {
        this.#saveCurrentAnswer();
        console.log(this.currentAnswers);
    }

    #saveCurrentAnswer() {
        let answer = document.querySelector('input[name="answer"]:checked');
        this.currentAnswers[this.currentId] = answer ? answer.value : null;
    }

    #showQuestion(question) {
        let output = document.getElementsByClassName('quiz-question')[0];
        let questionText = document.createElement('div');
        questionText.classList.add('quiz-question__text');
        questionText.innerText = question["question-text"];
        let questionAnswers = document.createElement('div');
        questionAnswers.classList.add('radio-selector');
        let allAnswers = question["wrong-answers"].slice()
        allAnswers.push(question["correct-answer"]);
        allAnswers = allAnswers.sort(function () {
            return Math.random() - 0.5;
        });
        for (let answer in allAnswers) {
            let curAnswerRadio = document.createElement('input')
            curAnswerRadio.type = "radio";
            curAnswerRadio.name = "answer";
            curAnswerRadio.value = allAnswers[answer];
            curAnswerRadio.id = "answer" + answer;
            let curAnswerLabel = document.createElement('label');
            curAnswerLabel.for = curAnswerRadio.id;
            curAnswerLabel.innerText = allAnswers[answer];
            questionAnswers.appendChild(curAnswerRadio);
            questionAnswers.appendChild(curAnswerLabel);
        }
        output.appendChild(questionText);
        output.appendChild(questionAnswers);
    }

    #removeQuestion() {
        document.getElementsByClassName('quiz-question')[0].replaceChildren();
    }
}

