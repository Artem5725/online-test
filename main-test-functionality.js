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
        this.shuffledQuestions = this.#randomizeQuestions(questionObj.questions);
        this.maxQuestionsCount = count;
        this.currentId = 0;
        this.currentAnswers = Array(count);
        this.currentAnswers.fill(null, 0, count);
        this.#removeQuestion();
        this.#showQuestion(this.shuffledQuestions[this.currentId]);
        this.quizFinished = false;
    }

    nextQuestion() {  // Todo перенести проверку после moveQuestion и отрубать кнопку
        if (this.currentId === this.maxQuestionsCount - 1) {
            return;
        }
        if (!this.quizFinished) {
            this.#saveCurrentAnswer();
        }
        this.currentId++;
        this.#moveQuestion();
    }

    prevQuestion() {
        if (this.currentId === 0) { // Todo перенести проверку после moveQuestion и отрубать кнопку
            return;
        }
        if (!this.quizFinished) {
            this.#saveCurrentAnswer();
        }
        this.currentId--;
        this.#moveQuestion();
    }

    #moveQuestion() {
        this.#removeQuestion();
        this.#showQuestion(this.shuffledQuestions[this.currentId]);
        this.#restoreAnswer();
        if (this.quizFinished) {
            this.#showRealResult();
        }
    }


    checkAnswers() {
        this.#saveCurrentAnswer();
        this.#removeQuestion();
        this.quizFinished = true;
        this.currentId = 0;
        this.#showQuestion(this.shuffledQuestions[this.currentId], true);
        this.#showRealResult(this.currentId);
        console.log(this.currentAnswers);
    }

    #saveCurrentAnswer() {
        let answer = document.querySelector('input[name="answer"]:checked');
        this.currentAnswers[this.currentId] = answer ? answer.value : null;
    }

    #restoreAnswer() {
        var currentAnswer = this.currentAnswers[this.currentId];
        if (currentAnswer) {
            document.querySelectorAll(`input[value="${CSS.escape(currentAnswer)}"]`)[0].checked = true;
        }
    }


    #showQuestion(question) {
        let output = document.getElementsByClassName('quiz-question')[0];
        let questionText = document.createElement('div');
        questionText.classList.add('quiz-question__text');
        questionText.innerText = question["question-text"];
        let questionAnswers = document.createElement('div');
        questionAnswers.classList.add('radio-selector');
        for (let answer in question.allAnswers) {
            let curAnswerRadio = document.createElement('input')
            curAnswerRadio.type = "radio";
            curAnswerRadio.name = "answer";
            curAnswerRadio.value = question.allAnswers[answer];
            curAnswerRadio.id = "answer" + answer;
            let curAnswerLabel = document.createElement('label');
            curAnswerLabel.for = curAnswerRadio.id;
            curAnswerLabel.innerText = question.allAnswers[answer];
            questionAnswers.appendChild(curAnswerRadio);
            questionAnswers.appendChild(curAnswerLabel);
        }
        output.appendChild(questionText);
        output.appendChild(questionAnswers);
    }

    #showRealResult() {
        let correctAnswer = this.shuffledQuestions[this.currentId]["correct-answer"];
        let chosenAnswer = this.currentAnswers[this.currentId];
        if (correctAnswer === chosenAnswer) {
            document.querySelectorAll(`input[value="${CSS.escape(correctAnswer)}"]`)[0].after("CORRECT");
        } else {
            document.querySelectorAll(`input[value="${CSS.escape(correctAnswer)}"]`)[0].after("CORRECT");
            document.querySelectorAll(`input[value="${CSS.escape(chosenAnswer)}"]`)[0].after("WRONG");
        }
    }

    #removeQuestion() {
        document.getElementsByClassName('quiz-question')[0].replaceChildren();
    }

    #randomizeQuestions(questions) {
        let sortedQuestions = questions.sort(function () { // randomize order of questions
            return Math.random() - 0.5;
        });
        for (let question of sortedQuestions) { // randomize order of answers for each question
            question.allAnswers = question["wrong-answers"].slice();
            question.allAnswers.push(question["correct-answer"]);
            question.allAnswers = question.allAnswers.sort(function () {
                return Math.random() - 0.5;
            });
        }
        return sortedQuestions;
    }

    // TODO  css + отдельно бахнуть разные стили и все цвета задавать через переменныеЮ а потом нужный стиль подставлять
    // TODO вывести отдельно показ результатов (сделать доп. кнопку - просмотр ответов)
    // TODO на крайних вопросах делать кнопки prev и next неактивными
    // TODO Менять кнопки при проходе теста
    /*
        .Disabled{
         pointer-events: none;
         cursor: not-allowed;
         opacity: 0.65;
         filter: alpha(opacity=65);
         -webkit-box-shadow: none;
         box-shadow: none;
         }
         1.30
*/

}

