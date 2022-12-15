async function testOperations() {
    let questionObj = await getTestQuestions();
    // prepare view - change buttons panel + clear questions field
    let manipulation = new Test(questionObj, 5);
    document.getElementsByClassName('quiz-navigation__next')[0].onclick = manipulation.nextQuestion.bind(manipulation);
    document.getElementsByClassName('quiz-navigation__prev')[0].onclick = manipulation.prevQuestion.bind(manipulation);
    document.getElementsByClassName('quiz-navigation__finish')[0].onclick = manipulation.checkAnswers.bind(manipulation);

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
        this.btnNext = document.querySelectorAll('.quiz-navigation__next')[0]
        this.btnPrev = document.querySelectorAll('.quiz-navigation__prev')[0]
        this.shuffledQuestions = this.#randomizeQuestions(questionObj.questions);
        this.maxQuestionsCount = count;
        this.currentId = 0;
        this.currentAnswers = Array(count);
        this.currentAnswers.fill(null, 0, count);
        this.#removeQuestion();
        this.#buttonBlock(this.btnPrev);
        this.#showQuestion(this.shuffledQuestions[this.currentId]);
        this.quizFinished = false;
    }

    nextQuestion() {
        if (!this.quizFinished) {
            this.#saveCurrentAnswer();
        }
        this.currentId++;
        this.#moveQuestion();
        if (this.currentId === this.maxQuestionsCount - 1) {
            this.#buttonBlock(this.btnNext); // перешли на последний вопрос кнопка next закрыта
        }
        else if(this.currentId === 1){ // перешли на вопрос 1 - кнопка prev активна
            this.#buttonUnblock(this.btnPrev);
        }

    }

    prevQuestion() {
        if (!this.quizFinished) {
            this.#saveCurrentAnswer();
        }
        this.currentId--;
        this.#moveQuestion();
        if (this.currentId === 0) {
            this.#buttonBlock(this.btnPrev);// перешли на 0 вопрос - кнопка prev закрыта
        }
        else if (this.currentId === this.maxQuestionsCount - 2){
            this.#buttonUnblock(this.btnNext); // вернулись на предпоследний вопрос - кнопка next активна
        }
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
        this.#restoreAnswer();
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
        questionAnswers.classList.add('radio-selector', 'quiz-question__answers');
        for (let answer in question.allAnswers) {
            let curAnswerRadio = document.createElement('input')
            curAnswerRadio.type = "radio";
            curAnswerRadio.name = "answer";
            curAnswerRadio.classList.add('radio-selector-entity__radio');
            curAnswerRadio.value = question.allAnswers[answer];
            curAnswerRadio.id = "answer" + answer;
            let curAnswerLabel = document.createElement('label');
            curAnswerLabel.htmlFor = curAnswerRadio.id;
            curAnswerLabel.innerText = question.allAnswers[answer];
            curAnswerLabel.classList.add('radio-selector-entity__label');
            let curAnswerEntity = document.createElement('div')
            curAnswerEntity.classList.add('radio-selector-entity');
            curAnswerEntity.appendChild(curAnswerRadio);
            curAnswerEntity.appendChild(curAnswerLabel);
            questionAnswers.appendChild(curAnswerEntity);
        }
        output.appendChild(questionText);
        output.appendChild(questionAnswers);
    }

    #buttonBlock(btn){
           btn.classList.add('button_blocked');
    }

    #buttonUnblock(btn){
        btn.classList.remove('button_blocked');
    }

    #prepareStatus(status) {
        let statusElem = document.createElement('div');
        statusElem.classList.add('quiz-question__status');
        statusElem.innerText = status;
        return statusElem;
    }

    #prepareCheck() {
        let check = document.createElement('i');
        check.classList.add('bi', 'bi-check', 'radio-selector-entity__check');
        return check;
    }

    #prepareCross() {
        let cross = document.createElement('i');
        cross.classList.add('bi', 'bi-x', 'radio-selector-entity__cross');
        return cross;
    }

    #showRealResult() {
        let correctAnswer = this.shuffledQuestions[this.currentId]["correct-answer"];
        let chosenAnswer = this.currentAnswers[this.currentId];
        if (!chosenAnswer) {
            let correct = document.querySelectorAll(`input[value="${CSS.escape(correctAnswer)}"]`)[0].parentElement;
            correct.classList.add("radio-selector-entity_correct");
            correct.appendChild(this.#prepareCheck());
            document.querySelectorAll('.quiz-question')[0].appendChild(this.#prepareStatus("No answer"));
        } else if (correctAnswer === chosenAnswer) {
            let correct = document.querySelectorAll(`input[value="${CSS.escape(correctAnswer)}"]`)[0].parentElement;
            correct.classList.add("radio-selector-entity_correct");
            correct.appendChild(this.#prepareCheck());
            document.querySelectorAll('.quiz-question')[0].appendChild(this.#prepareStatus("Correct"));
        } else {
            let correct = document.querySelectorAll(`input[value="${CSS.escape(correctAnswer)}"]`)[0].parentElement;
            correct.classList.add("radio-selector-entity_correct");
            correct.appendChild(this.#prepareCheck());
            let wrong = document.querySelectorAll(`input[value="${CSS.escape(chosenAnswer)}"]`)[0].parentElement;
            wrong.classList.add("radio-selector-entity_false");
            wrong.appendChild(this.#prepareCross());
            document.querySelectorAll('.quiz-question')[0].appendChild(this.#prepareStatus("Mistake"));
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

    // TODO  кнопка смены стилей + доп стили
    // TODO вывести отдельно показ результатов (сделать доп. кнопку - просмотр ответов)
    // TODO добавление/удаление кнопок со стр по необходимости
    // TODO отредачить кнопки на узкой стр
    // TODO refactor
}

