const categories = {
    "Sports": 21,
    "Animals": 27,
    "Science & Nature": 17,
    "History": 23,
    "Art": 25
  };
  
  document.getElementById("startButton").addEventListener("click", setToken);
  document.getElementById("resetButton").addEventListener("click", resetGame);
  
  function setToken() {
    $.ajax({
      url: "https://opentdb.com/api_token.php?command=request",
      method: "GET",
      dataType: "json"
    })
    .done(function(response) {
      console.log("Token received:", response.token);
      window.localStorage.setItem("token", response.token);
      startGame();
    })
    .fail(function() {
      console.log("Error retrieving token");
    });
  }
  
  function startGame() {
    document.getElementById("startButton").disabled = true;
    document.getElementById("resetButton").disabled = false;
    document.getElementById("total").textContent = "0";
    populateBoard();
  }
  
  function populateBoard() {
    let categoryDivs = document.getElementsByClassName("category");
    let categoryKeys = Object.keys(categories);
    categoryKeys.forEach((key, index) => {
      categoryDivs[index].textContent = key;
      categoryDivs[index].setAttribute("data-cat", categories[key]);
    });
  
    let questionDivs = document.getElementsByClassName("question");
    Array.from(questionDivs).forEach((div, index) => {
      let pointValue = (Math.floor(index / 5) + 1) * 10;
      let difficulty = pointValue === 50 ? "hard" : pointValue > 10 ? "medium" : "easy";
      div.textContent = pointValue;
      div.setAttribute("data-point", pointValue);
      div.setAttribute("data-difficulty", difficulty);
      div.setAttribute("data-cat", categories[categoryKeys[index % categoryKeys.length]]);
      div.removeEventListener("click", loadQuestion); // Corrected to use loadQuestion for real functionality
      div.addEventListener("click", loadQuestion);
    });
  }
  
  function loadQuestion() {
    let token = window.localStorage.getItem("token");
    let category = this.getAttribute("data-cat");
    let difficulty = this.getAttribute("data-difficulty");
  
    $.ajax({
      url: `https://opentdb.com/api.php?amount=1&category=${category}&difficulty=${difficulty}&type=multiple&token=${token}`,
      dataType: "json"
    })
    .done((response) => {
      viewQuestion(response.results[0], this.id); // Pass this.id to track which question was answered
    })
    .fail(() => {
      console.log("Error loading question");
    });
  }
  
  function viewQuestion(questionData, questionId) {
    let modal = document.getElementById("qaModal");
    let answers = [questionData.correct_answer, ...questionData.incorrect_answers];
    shuffle(answers);
  
    modal.style.display = "block";
    document.getElementById("questionArea").innerHTML = questionData.question;
    let answerArea = document.getElementById("answerArea");
    answerArea.innerHTML = answers.map((answer, index) => {
      let isCorrect = answer === questionData.correct_answer ? 'correct' : 'incorrect';
      return `<div><input type="radio" name="qa" value="${isCorrect}" id="answer${index}">
              <label for="answer${index}">${answer}</label></div>`;
    }).join('');
  
    window.localStorage.setItem("currentIndex", questionId); // Save the id of the current question
    
    // Setup to close the modal when clicking outside or on 'X'
    let closeX = document.getElementsByClassName("close")[0];
    closeX.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  }
  
  function checkResponse() {
    // Ensure there's a selected answer
    let selectedAnswer = document.querySelector("input[name='qa']:checked");
    if (!selectedAnswer) {
        alert('Please select an answer.');
        return; // Exit the function if no answer is selected
    }

    let modal = document.getElementById("qaModal");
    let index = window.localStorage.getItem("currentIndex");
    let questionDiv = document.getElementById(index);
    let points = parseInt(questionDiv.getAttribute("data-point"));
    let scoreElement = document.getElementById("total");
    let score = parseInt(scoreElement.textContent);

    // Determine if the selected answer is correct and update the score
    if (selectedAnswer.value === "correct") {
        score += points;
        document.getElementById("feedback").textContent = "Correct!";
    } else {
        score -= points;
        document.getElementById("feedback").textContent = "Wrong. The correct answer is: Answer 1";
    }

    // Update the score
    scoreElement.textContent = score;
    
    // Wait a moment before clearing the question and hiding the modal, to allow the user to see the feedback
    setTimeout(() => {
        questionDiv.textContent = ""; // Clear the question
        modal.style.display = "none"; // Close the modal
        questionDiv.removeEventListener("click", viewQuestion); // Prevent re-answering
    }, 1500); // Delay in milliseconds before closing the modal
}




  
  function resetGame() {
    document.getElementById("startButton").disabled = false;
    document.getElementById("resetButton").disabled = true;
    document.getElementById("feedback").textContent = "Click Start to begin.";
    document.getElementById("total").textContent = "0"; // Reset the score
  
    // Clear all questions and reset their event listeners
    let questionDivs = document.getElementsByClassName("question");
    Array.from(questionDivs).forEach((div) => {
      div.textContent = ""; // Clear text
      div.removeAttribute("data-cat");
      div.removeAttribute("data-point");
      div.removeAttribute("data-difficulty");
      div.removeEventListener("click", loadQuestion); // Reset event listeners
    });
  
    // Repopulate the board to reset the game fully
    populateBoard();
  }
  
  // Shuffle function for answers
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  // Ensure that you have a submit button with id="submitResponse" in your modal
  document.getElementById("submitResponse").addEventListener("click", function(event) {
    event.preventDefault(); // Prevent form submission
    checkResponse();
  });
  