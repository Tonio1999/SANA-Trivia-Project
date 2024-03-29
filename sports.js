$(document).ready(function() {
  var questionsList = [
    {
      text: "When Michael Jordan played for the Chicago Bulls, how many NBA Championships did he win?",
      choices: [
        "6",
        "8",
        "2",
        "3"
      ],
      correctChoiceIndex: 0
    },
    {
      text: "Which Williams sister has won more Grand Slam titles?",
      choices: [
        "Venus",
        "Serena",
        "Yetunde",
        "Lyndrea"
      ],
      correctChoiceIndex: 1
    },
    {
      text: "Which racer holds the record for the most Grand Prix wins?",
      choices: [
          "Niki Lauda", "Ayrton Senna", "Lewis Hamilton", "Michael Schumacher"],
      correctChoiceIndex: 3,
    },
    {
      text: "Which Jamaican runner is an 11-time world champion and holds the record in the 100 and 200-meter race?",
      choices: ["Asafa Powell",
      "Yohan Blake",
      "Usain Bolt",
      "Nesta Carter"],
      correctChoiceIndex: 2,
    },
    {
      text: "Which boxer was known as “The Greatest” and “The People’s Champion”?",
      choices: ["Manny Pacquiao",
         "Muhammad Ali",
         "Floyd Mayweather",
         "Joe Lewis"],
      correctChoiceIndex: 1,
    },
    {
      text: "What country won the very first FIFA World Cup in 1930?",
      choices: ["Mexico", "Germany", "Uruguay", "Brazil"],
      correctChoiceIndex: 2,
    },
    {
      text: "Which of these events is NOT part of a decathlon?",
      choices: ["Hammer throw", "Long Jump", "Discus throw", "Javelin throw"],
      correctChoiceIndex: 0,
    },
    {
      text: "Which hockey team did Wayne Gretzky play for in the ‘80s?",
      choices: ["Edmonton Oilers", "Florida Panthers", "Minnesota Wild", "Los Angeles Kings"],
      correctChoiceIndex: 0,
    },
    {
      text: "In what year was the first ever Wimbledon Championship held?",
      choices: ["1878", "1877", "1870", "1874"],
      correctChoiceIndex: 1,
    },
    {
      text: "How many soccer players should each team have on the field at the start of each match?",
      choices: ["10", "9", "8", "11"],
      correctChoiceIndex: 3,
    },
  ];

  var quiz = {
    sportsscore: 0,
    questions: [],
    currentQuestionIndex: 0,

    currentQuestion: function() {
      return this.questions[this.currentQuestionIndex]
    },

    answerFeedbackHeader: function(isCorrect) {
      return isCorrect ? "<h6 class='user-was-correct'>Correct!</h6>" :
        "<h1 class='user-was-incorrect'>Wrong!</>";
    },

    answerFeedbackText: function(isCorrect) {
      var praises = [
        "Wow. You got it right. I bet you feel really good about yourself now",
        "Correct. Which would be impressive, if it wasn't just luck"
      ];

      var encouragements = [
        "Sorry, you didn't get that right. Try to read more.",
        "Better luck next time. Sure, you can get it if you try to be mindful.",
      ];

      var choices = isCorrect ? praises : encouragements;
      return choices[Math.floor(Math.random() * choices.length)];
    },

    seeNextText: function() {
      return this.currentQuestionIndex <
      this.questions.length - 1 ? "Next" : "How did I do?";
    },

    questionCountText: function() {
      return (this.currentQuestionIndex + 1) + "/" +
        this.questions.length + ": ";
    },

    finalFeedbackText: function() {
      var user = auth.currentUser;
      var sportsscore = this.sportsscore;
      user.providerData.forEach(function (profile) {
                                db.collection("users").doc(profile.displayName).update({sportsscore})
        });
      var level = ""
      if (this.sportsscore < 5) {
        level = "BEGINNER";
      } else if (this.sportsscore < 8) {
        level = "INTERMEDIATE";
      } else {
        level = "ADVANCED";
      }
      return "You got " + this.sportsscore + " out of " +
        this.questions.length + " questions right." + "\n" + "Level " + level;
    },

    scoreUserAnswer: function(answer) {
      var correctChoice = this.currentQuestion().choices[this.currentQuestion().correctChoiceIndex];
      if (answer === correctChoice) {
        // this increments a number
        // Check README for a quick exercise
        this.sportsscore ++;
      }
      return answer === correctChoice;
    }
  }

  // create a new instance of quiz via Object.create
  function newQuiz() {
    var quizO = Object.create(quiz);
    quizO.questions = questionsList;
    return quizO;
  }

  function makeCurrentQuestionElem(quiz) {
    var questionElem = $("#js-question-template" ).children().clone();
    var question = quiz.currentQuestion();

    questionElem.find(".js-question-count").text(quiz.questionCountText());
    questionElem.find('.js-question-text').text(question.text);

    for (var i = 0; i < question.choices.length; i++) {
      var choice = question.choices[i];
      var choiceElem = $( "#js-choice-template" ).children().clone();
      choiceElem.find("input").attr("value", choice);
      var choiceId = "js-question-" + quiz.currentQuestionIndex + "-choice-" + i;
      choiceElem.find("input").attr("id", choiceId)
      choiceElem.find("label").text(choice);
      choiceElem.find("label").attr("for", choiceId);
      questionElem.find(".js-choices").append(choiceElem);
    };

    return questionElem;
  }

  function makeAnswerFeedbackElem(isCorrect, correctAnswer, quiz) {
    var feedbackElem = $("#js-answer-feedback-template").children().clone();
    feedbackElem.find(".js-feedback-header").html(quiz.answerFeedbackHeader(isCorrect));
    feedbackElem.find(".js-feedback-text").text(quiz.answerFeedbackText(isCorrect));
    feedbackElem.find(".js-see-next").text(quiz.seeNextText());
    return feedbackElem;
  }

  function makeFinalFeedbackElem(quiz) {
    var finalFeedbackElem = $("#js-final-feedback-template").clone();
    finalFeedbackElem.find(".js-results-text").text(quiz.finalFeedbackText());
    return finalFeedbackElem;
  }

  function handleSeeNext(quiz, currentQuestionElem) {
    $("article.quiz-details").on("click", ".js-see-next", function(event) {

      if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
        $("article.quiz-details").off("click", ".js-see-next");
        quiz.currentQuestionIndex ++;
        $("article.quiz-details").html(makeCurrentQuestionElem(quiz));
      }
      else {
        $("article.quiz-details").html(makeFinalFeedbackElem(quiz))
      }
    });
  }

  function handleAnswers(quiz) {
    $("article.quiz-details").on("submit", "form[name='current-question']", function(event) {
      event.preventDefault();
      var answer = $("input[name='user-answer']:checked").val();
      quiz.scoreUserAnswer(answer);
      var question = quiz.currentQuestion();
      var correctAnswer = question.choices[question.correctChoiceIndex]
      var isCorrect = answer === correctAnswer;
      handleSeeNext(quiz);
      $("article.quiz-details").html(makeAnswerFeedbackElem(isCorrect, correctAnswer, quiz));
    });
  }

  // We can only use handleAnswers and handleRestarts when the quiz object has been created.
  // The submit event listener will create the quiz object then call other listeners.
  // On browser refresh, that object isn't saved and that's fine. If you want to remember states and objects, use localStorage
  // But we don't need that now.
  function handleStartQuiz() {
    $("article.quiz-details").html($("#js-start-template").clone());
    $("form[name='quiz-start']").submit(function(event) {
      var quiz = newQuiz();
      event.preventDefault();
      $("article.quiz-details").html(makeCurrentQuestionElem(quiz));
      handleAnswers(quiz);
      handleRestarts();
    });
  }

  // The .off() method removes event handlers that were attached with .on()
  // In this case, the listeners are handleAnswers(), handleSeeNext() and even handleRestarts()
  // handleStartQuiz will be called again to create the new quiz object and call functions with listeners
  // See how we called this once on load.
  function handleRestarts() {
    $("article.quiz-details").on("click", ".js-restart-quiz", function(event){
      event.preventDefault();
      $("article.quiz-details").off();
      handleStartQuiz();
    });
  }

  handleStartQuiz();
});
