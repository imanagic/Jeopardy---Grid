const categories = ["Sports", "Animals", "Science & Nature", "History", "Art"];

// Add event listeners for start and reset buttons
document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("resetButton").addEventListener("click", resetGame);

function startGame() {
    document.getElementById("startButton").disabled = true;
    document.getElementById("resetButton").disabled = false;
    document.getElementById("total").textContent = "0"; // Zero out any previous score
    populateBoard(); // Call populateBoard function
}

function populateBoard() {
    let categoryDivs = document.getElementsByClassName("category");
    for (let i = 0; i < categories.length; i++) {
        categoryDivs[i].textContent = categories[i];
    }

    let questionDivs = document.getElementsByClassName("question");
    for (let i = 0; i < questionDivs.length; i++) {
        let pointValue = (Math.floor(i / 5) + 1) * 10;
        questionDivs[i].textContent = pointValue;
        questionDivs[i].setAttribute("data-point", pointValue);
        questionDivs[i].setAttribute("id", "question" + i);
        questionDivs[i].addEventListener("click", viewQuestion);
    }
}

function viewQuestion() {
    let modal = document.getElementById("qaModal");
    let closeX = document.getElementsByClassName("close")[0];

    // Display the modal
    modal.style.display = "block";
    document.getElementById("questionArea").innerHTML = "Pretend question for " + this.getAttribute("data-point") + " points?";

    // Attach event listener to close button
    closeX.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Save the current index in local storage to use in checkResponse
    window.localStorage.setItem("currentIndex", this.id);
}

function checkResponse() {
    let modal = document.getElementById("qaModal");
    let index = window.localStorage.getItem("currentIndex");
    let questionDiv = document.getElementById(index);
    let selectedAnswer = document.querySelector("input[name='qa']:checked").value;
    let points = parseInt(questionDiv.getAttribute("data-point"));
    let scoreElement = document.getElementById("total");
    let score = parseInt(scoreElement.textContent);

    if (selectedAnswer === "correct") {
        score += points;
        document.getElementById("feedback").textContent = "Correct!";
    } else {
        score -= points;
        document.getElementById("feedback").textContent = "Wrong. The correct answer is: Answer 1";
    }

    scoreElement.textContent = score;
    questionDiv.textContent = ""; // Clear the question
    modal.style.display = "none"; // Close the modal

    // Remove event listener to prevent re-answering
    questionDiv.removeEventListener("click", viewQuestion);
}

function resetGame() {
    document.getElementById("startButton").disabled = false;
    document.getElementById("resetButton").disabled = true;
    document.getElementById("feedback").textContent = "Click Start to begin.";
    document.getElementById("total").textContent = "0"; // Reset score

    let questionDivs = document.getElementsByClassName("question");
    for (let questionDiv of questionDivs) {
        questionDiv.textContent = ""; // Clear all questions
        questionDiv.removeAttribute("id");
        questionDiv.removeEventListener("click", viewQuestion);
    }
}

// Ensure that you have a submit button with id="submitResponse" in your modal
document.getElementById("submitResponse").addEventListener("click", function(event) {
    event.preventDefault(); // Prevent form submission if using a form
    checkResponse();
});
