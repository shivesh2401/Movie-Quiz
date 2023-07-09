//* Alter this set of variables for the Quiz game play
const SetQtyOfQuestions = 10; //* amount of questions for the quiz
const highScoresToShow = 8; //* amount of high scores to shw in high score list
const pointsPerCorrectAnswerEasy = 1; //* points for easy questions
const pointsPerCorrectAnswerHard = 2; //* points for hard questions
const pointsPerCorrectAnswerMedium = 1.5; //* points for medium questions
const questionsToFetchMultiplier = 3; //* Multiplies the amount of questions fetched (used within qtyOfQuestionsToFetch)
const qtyOfQuestionsToFetch = (SetQtyOfQuestions * questionsToFetchMultiplier); //* increase this value to increase the randomness of the questions, 
//* only fetching SetQtyOfQuestions value only pulls from the first section of the API, 
//* Check the actual amount of questions that are available though from the API.

const answers = Array.from(document.getElementsByClassName("answers-text-jsRef"));
const answerContainer1 = document.getElementById("answer-container-1-jsRef");
const answerContainer2 = document.getElementById("answer-container-2-jsRef");
const answerContainer3 = document.getElementById("answer-container-3-jsRef");
const answerContainer4 = document.getElementById("answer-container-4-jsRef");
const continuePlayingButton = document.querySelector("#btn-continue-playing-jsRef");
const endGameHighScoresList = document.querySelector(".endGameHighScoresList-jsRef");
const exitGame = document.getElementById("btn-exit-game-jsRef");
const exitQuizContainer = document.querySelector("#exit-quiz-container-jsRef");
const highScoresContainer = document.querySelector("#high-score-container-jsRef");
const highScoresList = document.querySelector(".highScoresList-jsRef");
const homeContainer = document.querySelector("#home-container-jsRef");
const homeScreenButton = document.querySelector("#btn-view-home-screen-jsRef");
const loadingSpinner = document.querySelector(".loadingSpinner-jsRef");
const muteButton = document.getElementById("btn-mute-jsRef");
const playButton = document.querySelector("#btn-play-game-jsRef");
const playerFinalScore = document.getElementById("playerFinalScore-jsRef");
const playername = document.getElementById("playername-jsRef");
const progressBarFull = document.querySelector("#progressBarFull-jsRef");
const progressText = document.getElementById("progressText-jsRef");
const question = document.getElementById("question-jsRef");
const quizContainer = document.querySelector("#quiz-container-jsRef");
const returnHomeScreenButton = document.querySelector("#btn-return-to-home-screen-jsRef");
const saveHighScore = document.querySelector("#btn-save-score-jsRef");
const saveScoreBtn = document.getElementById("btn-save-score-jsRef");
const scoreText = document.querySelector("#score-jsRef");
const showExitGameOptions = document.getElementById("exit-quiz-options-jsRef");
const soundCorrect = new Audio("assets/sounds/sound-correct.mp3");
const soundIncorrect = new Audio("assets/sounds/sound-incorrect.mp3");
const unMuteButton = document.getElementById("btn-unmute-jsRef");
const userFinalScoreContainer = document.querySelector("#user-final-score-container-jsRef");
const viewHighScoresButton = document.querySelector("#btn-view-high-scores-jsRef");
let acceptingAnswers = false;
let actualAnswer = answerContainer1;
let availableQuestions = [];
let newQuestion = {};
let getNewQuestion;
let highScores = [];
let incrementScore;
let level = document.getElementById("selectLevelRef").value;
let pointsPerCorrectAnswer = pointsPerCorrectAnswerEasy; //* default value for easy -
let questionCounter = 0;
let questions = [];
let score = 0;
let quizUrl = `https://opentdb.com/api.php?amount=${qtyOfQuestionsToFetch}&category=11&difficulty=${level}&type=multiple`;
soundCorrect.volume = 0.4;
soundIncorrect.volume = 0.4;


//* event listeners
continuePlayingButton.addEventListener("click", closeExitOverlayScreen);
exitGame.addEventListener("click", returnToHomeScreen);
homeScreenButton.addEventListener("click", returnToHomeScreen);
muteButton.addEventListener("click", sounds);
playButton.addEventListener("click", startQuiz);
returnHomeScreenButton.addEventListener("click", returnToHomeScreen);
saveHighScore.addEventListener("click", saveTheHighScore);
showExitGameOptions.addEventListener("click", showExitQuizContainer);
unMuteButton.addEventListener("click", sounds);
playername.addEventListener("keyup", () => {
	saveScoreBtn.disabled = !playername.value;
});
viewHighScoresButton.addEventListener("click", showHighScoresScreen);


/** 
 * retrieves and updates the session storage 
 * altering the key(sounds)from mute to play
 */
function sounds() {
	if (sessionStorage.getItem("sounds") == undefined) {
		sessionStorage.setItem("sounds", "mute");
	} else if (sessionStorage.getItem("sounds") == "mute") {
		sessionStorage.setItem("sounds", "play");
	} else {
		sessionStorage.setItem("sounds", "mute");
	}
	sfxMuteOrPlay();
}


/** 
 * alternates the SFX button 
 * and mutes/plays the SFX accordingly
 */
function sfxMuteOrPlay() {
	if (sessionStorage.getItem("sounds") == "mute") {
		soundCorrect.muted = true;
		soundIncorrect.muted = true;
		muteButton.classList.add("hidden");
		unMuteButton.classList.remove("hidden");
	} else {
		soundCorrect.muted = false;
		soundIncorrect.muted = false;
		unMuteButton.classList.add("hidden");
		muteButton.classList.remove("hidden");
	}
}


/**
 * Adds the points information to the home screen. 
 */
function addPointsInformationToTheHomePage() {
	let pointsInformation = document.getElementById("points-information");
	let pointsInformationText = `Easy - ${pointsPerCorrectAnswerEasy} point per question,<br>
								Medium - ${pointsPerCorrectAnswerMedium} points per question &<br>
								Hard - ${pointsPerCorrectAnswerHard} points per question`;
	pointsInformation.innerHTML = pointsInformationText;
}
addPointsInformationToTheHomePage();


/**  
 * Hides the welcome page and 
 * shows the quiz 
 */
function showQuizContainer() {
	homeContainer.classList.add("hidden");
	quizContainer.classList.remove("hidden");
	muteButton.classList.remove("hidden");
}


/** 
 * Returns to the home screen 
 * hiding all containers 
 */
function returnToHomeScreen() {
	quizContainer.classList.add("hidden");
	userFinalScoreContainer.classList.add("hidden");
	highScoresContainer.classList.add("hidden");
	muteButton.classList.add("hidden");
	unMuteButton.classList.add("hidden");
	exitQuizContainer.classList.add("hidden");
	homeContainer.classList.remove("hidden");
}


/**  
 * Hides the welcome page and 
 * shows the quiz 
 */
function showExitQuizContainer() {
	exitQuizContainer.classList.remove("hidden");
}


/** 
 * Hide the Exit quiz message container  
 */
function closeExitOverlayScreen() {
	exitQuizContainer.classList.add("hidden");
}


/** Adds sample high Score to the session storage, 
 * The first statement checks if the one time 
 * function has NOT been executed before
 */
window.onload = function () {
	if (sessionStorage.getItem("hasSampleScoresBeenAddedBefore") == null) {
		/** this is to add some sample high scores to local storage */
		let letsAddSomeSampleHighScores = [{
				"score": (Math.floor(Math.random() * SetQtyOfQuestions) + 1) * pointsPerCorrectAnswerHard,
				"name": "Arthur"
			},
			{
				"score": (Math.floor(Math.random() * SetQtyOfQuestions) + 1) * pointsPerCorrectAnswerHard,
				"name": "Ford"
			},

			{
				"score": (Math.floor(Math.random() * SetQtyOfQuestions) + 1) * pointsPerCorrectAnswerHard,
				"name": "Zaphod"
			},
			{
				"score": (Math.floor(Math.random() * SetQtyOfQuestions) + 1) * pointsPerCorrectAnswerMedium,
				"name": "Marvin"
			},
			{
				"score": (Math.floor(Math.random() * SetQtyOfQuestions) + 1) * pointsPerCorrectAnswerMedium,
				"name": "Trillian"
			},
			{
				"score": (Math.floor(Math.random() * SetQtyOfQuestions) + 1) * pointsPerCorrectAnswerMedium,
				"name": "Fenchurch"
			},
			{
				"score": (Math.floor(Math.random() * SetQtyOfQuestions) + 1) * pointsPerCorrectAnswerMedium,
				"name": "Bowerick"
			},
			{
				"score": (Math.floor(Math.random() * SetQtyOfQuestions) + 1) * pointsPerCorrectAnswerMedium,
				"name": "Slartibartfast"
			},
			{
				"score": (Math.floor(Math.random() * SetQtyOfQuestions) + 1) * pointsPerCorrectAnswerEasy,
				"name": "Colin"
			},
			{
				"score": (Math.floor(Math.random() * SetQtyOfQuestions) + 1) * pointsPerCorrectAnswerEasy,
				"name": "Eddie"
			},
			{
				"score": (Math.floor(Math.random() * SetQtyOfQuestions) + 1) * pointsPerCorrectAnswerEasy,
				"name": "Frankie & Benjy"
			}
		];
		letsAddSomeSampleHighScores.sort((a, b) => b.score - a.score);
		letsAddSomeSampleHighScores.splice(highScoresToShow);
		sessionStorage.setItem("highScores", JSON.stringify(letsAddSomeSampleHighScores));
		sessionStorage.setItem("hasSampleScoresBeenAddedBefore", true);
		highScoresRetrieveAndSort();
	}
};


/** 
 * retrieves lowest High Score, 
 * checks it against the user score and 
 * if the score is less than or equal to the lowest score 
 * it hides the username input and submit buttons
 */
function hideSubmitButtonIfLowestScore() {
	let highScoresNumbers = 0;
	let lowestHighScoresNumber = 0;
	highScoresNumbers = JSON.parse(sessionStorage.getItem("highScores")).map(function (i) {
		return i.score;
	});
	highScoresNumbers.sort((a, b) => a - b);
	highScoresNumbers.splice(1);
	lowestHighScoresNumber = highScoresNumbers.toString();
	if (score < lowestHighScoresNumber) {
		saveHighScore.classList.add("hidden");
		playername.classList.add("hidden");
	}
}


/** 
 * function to start the game and 
 * any previous scores
 */
function startQuiz() {
	scoreText.innerText = 0;
	score = 0;
	playerFinalScore.innerText = `You scored ${score}`;
	progressBarFull.classList.remove("progress-bar-rounded");
	questionCounter = 0;
	setTimeout(() => {
		showQuizContainer();
		sfxMuteOrPlay();
		availableQuestions = [...questions];
		getNewQuestion();
		loadingSpinner.classList.add("hidden");
	}, 500);
}


/**
 * Set the correct points per question dependant 
 * on the user selected difficulty level 
 */
function pointsPerQuestion() {
	if (level == "hard") {
		pointsPerCorrectAnswer = pointsPerCorrectAnswerHard;
	} else if (level == "medium") {
		pointsPerCorrectAnswer = pointsPerCorrectAnswerMedium;
	} else {
		pointsPerCorrectAnswer = pointsPerCorrectAnswerEasy;
	}
}


/** Retrieve and sort the 
 * high scores numerically
 */
function highScoresRetrieveAndSort() {
	highScores = JSON.parse(sessionStorage.getItem("highScores")) || [];
	highScores.sort((a, b) => {
		return b.score - a.score;
	});
}


/**
 * Fetch the questions from an API 
 * using the user selected difficulty as the quiz level 
 * and map the question to an array 
 */
function fetchTheQuestions() {

	fetch(quizUrl)
		.then((res) => {
			return res.json();
		})
		.then((loadedQuestions) => {
			questions = loadedQuestions.results.map((loadedQuestion) => {
				const formattedQuestion = {
					question: loadedQuestion.question,
				};
				const availableAnswers = [...loadedQuestion.incorrect_answers];
				formattedQuestion.CorrectAnswer = Math.floor(Math.random() * 4) + 1;
				availableAnswers.splice(
					formattedQuestion.CorrectAnswer - 1,
					0,
					loadedQuestion.correct_answer
				);

				availableAnswers.forEach((answers, index) => {
					formattedQuestion["answers" + (index + 1)] = answers;
				});

				return formattedQuestion;
			});
		});
}


/** 
 * Allows the user to select a difficulty level
 * for the quiz  then fetches the questions
 */
function updateQuizLevel() {
	level = document.getElementById("selectLevelRef").value;
	quizUrl = `https://opentdb.com/api.php?amount=${qtyOfQuestionsToFetch}&category=11&difficulty=${level}&type=multiple`;
	pointsPerQuestion();
	sessionStorage.setItem("API-URL", quizUrl);
	fetchTheQuestions();
}
updateQuizLevel();


/** 
 * Checks if the maximum amount of questions 
 * per quiz has been reached and if so 
 * go to user final score page 
 */
function maxQuestionsReached() {
	if (availableQuestions.length === 0 || questionCounter >= SetQtyOfQuestions) {
		sessionStorage.setItem("mostRecentScore", score);
		endGameHighScores();
		quizContainer.classList.add("hidden");
		userFinalScoreContainer.classList.remove("hidden");
		hideSubmitButtonIfLowestScore();
		muteButton.classList.add("hidden");
		unMuteButton.classList.add("hidden");
	}
}


/** 
 * Saves the high score 
 * to session storage 
 */
function saveTheHighScore(submit) {

	submit.preventDefault();

	score = {
		score: score,
		name: playername.value
	};
	highScores.push(score);
	highScores.sort((a, b) => b.score - a.score);
	highScores.splice(highScoresToShow);

	sessionStorage.setItem("highScores", JSON.stringify(highScores));
	window.location.assign("index.html");
}


/** 
 * retrieves and creates a string 
 * to display High Scores in the 
 * end game page 
 */
function endGameHighScores() {
	highScoresRetrieveAndSort();
	endGameHighScoresList.innerHTML = highScores
		.map(score => {
			return `<li class="high-score"><span>${score.score}</span>\t<span>${score.name}</span</li>`;
		})
		.join("");
}


/**  
 * Retrieve questions 
 * from the array 
 */
getNewQuestion = () => {
	maxQuestionsReached();

	questionCounter++;

	//Updates the progress bar
	progressText.innerText = `Question ${questionCounter}/${SetQtyOfQuestions}`;

	progressBarFull.style.width = `${(questionCounter / SetQtyOfQuestions) * 100}%`;
	if (availableQuestions.length === 0 || questionCounter >= SetQtyOfQuestions) {
		progressBarFull.classList.add("progress-bar-rounded");
	}

	//creates a random number between 1 and the qty of remaining questions and sets the current question to that question number
	const questionIndex = Math.floor(Math.random() * (qtyOfQuestionsToFetch - (questionCounter - 1)));
	newQuestion = availableQuestions[questionIndex];

	// adds current question to the Question section 
	question.innerHTML = newQuestion.question;

	// gets the correct answer information from the set of questions
	answers.forEach((answers) => {
		const number = answers.dataset.number;
		answers.innerHTML = newQuestion["answers" + number];
	});
	//removes the current question from the available questions list
	availableQuestions.splice(questionIndex, 1);
	acceptingAnswers = true;
};


/** 
 * check which answer the user has chosen, 
 * indicate if correct and add points 
 * to score if appropriate
 */
answers.forEach((answers) => {
	answers.addEventListener("click", (e) => {
		if (!acceptingAnswers) return;

		acceptingAnswers = false;
		const answersSet = e.target;
		const userSelectedAnswer = answersSet.dataset.number;
		let correctAnswer = newQuestion.CorrectAnswer;
		// console.log("The Correct Answer was ",correctAnswer);

		//check if the user has selected the correct answer 
		const classToApply = userSelectedAnswer == correctAnswer ? "answered-correct" : "answered-incorrect";
		//if  answer correct increase the user score
		if (classToApply === "answered-correct") {
			incrementScore(pointsPerCorrectAnswer);
			soundCorrect.play();
		} else {
			soundIncorrect.play();
			switch(correctAnswer){
				case 1:
					actualAnswer = answerContainer1;
					break;
				case 2:
					actualAnswer = answerContainer2;
					break;
				case 3:
					actualAnswer = answerContainer3;
					break;
				default:
					actualAnswer = answerContainer4;
			}
			actualAnswer.classList.add("answer-was-actual-correct");
		}

		answersSet.parentElement.classList.add(classToApply);

		setTimeout(() => {
			answersSet.parentElement.classList.remove(classToApply);
			actualAnswer.classList.remove("answer-was-actual-correct");
			getNewQuestion();
		}, 1500);
	});		
});


/** 
 * Update the users score
 */
incrementScore = (questionPointsValue) => {
	score += questionPointsValue;
	scoreText.innerText = score;
	playerFinalScore.innerText = `You scored ${score}`;


};


/** 
 * retrieves and creates a string 
 * to display High Scores in the 
 * High Scores page 
 */
function showHighScoresScreen() {
	highScoresRetrieveAndSort();

	homeContainer.classList.add("hidden");
	highScoresContainer.classList.remove("hidden");

	highScoresList.innerHTML = highScores
		.map(score => {
			return `<li class="high-score"><span>${score.score}</span>\t<span>${score.name}</span</li>`;
		})
		.join("");
}