/// Retrieve token.
// If token is present, we will render the submit page, else the login page.
let authToken = () => localStorage.getItem('token');
let groupName = () => localStorage.getItem('groupName');
let puzzleName = () => window.location.href.split("/").slice(-1)[0].split(".")[0];

/// Reset all input field.
// Reset when press submit and close window.
function resetModal() {
    $('#checkAnswerForm input').val('');
    $('#checkAnswerResult').empty().removeClass('correct').removeClass('incorrect');
    $('#loginForm input').val('');
    $('#loginResult').empty().removeClass('correct').removeClass('incorrect');
}

/// HTML for login
function showLogin() {
    let puzzle = puzzleName();
    const htmlLogin = `
        <div class="header-links">
          <div id="login" class="header-link">
            <a href="${puzzle}.html#" data-toggle="modal" data-target="#loginModal">Login</a>
          </div>


          <div class="modal fade" id="loginModal" tabindex="-1" role="dialog" aria-labelledby="loginModalLabel"
               data-puzzle-id="${puzzle}">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span>
                  </button>
                  <span class="modal-title" id="loginModalLabel">Enter your team name and password</span>
                </div>
                <div class="modal-body">
                  <form id="loginForm" action="${puzzle}.html#">
                  <div style="display:flex">
                    <input type="text" placeholder="Team Name"/>
                    </div>
                    <div style="display:flex">
                    <input type="password" placeholder="Password"/>
                    </div>
                    <div id="resp-buttons">
                    <button type="submit">Login</button>
                    </div>
                  </form>
                  <div id="loginResult">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`
    let div = document.createElement('div');
    let headerBar = document.querySelector("#header-bar");
    div.innerHTML = htmlLogin.trim();
    headerBar.appendChild(div.firstChild);
}
/// HTML for check answer
function showSubmit() {
    let puzzle = puzzleName();
    let group = groupName();
    let welcomeDescription = group === null ? 'Welcome!' : `Welcome, ${group}! `;
    const htmlSubmit = `
        <div class="header-links">
          <div id="check_answer" class="header-link"><a href="${puzzle}.html#" data-toggle="modal" id="checkAnswerButton"
                                                    data-target="#checkAnswerModal">Submit Answer</a></div>
<!--          <div id="submit" class="header-link"><a href="../solutions/${puzzle}.html">Solution</a></div>-->
                <div class="header-link header-dropdown">
                    <div id="welcome" class="header-dropdown-title">
                        <a>${welcomeDescription}<span class="fas fa-caret-down"></span></a>
                    </div>
                    <div class="dropdown-content-wrapper">
                        <div class="dropdown-link"><a id="logout">Logout</a></div>
                    </div>
                </div>
          

          <div class="modal fade" id="checkAnswerModal" tabindex="-1" role="dialog" aria-labelledby="checkAnswerModalLabel"
               data-puzzle-id="${puzzle}">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span>
                  </button>
                  <span class="modal-title" id="checkAnswerModalLabel">Submit Answer</span>
                </div>
                <div class="modal-body" id="dialog_content">
                <div id="numHints" style="margin-bottom: 10px"></div>
                <div id="lengthHint" style="margin-bottom: 10px"></div>
                <form id="checkAnswerForm" action="${puzzle}.html#">
                    <div style="display:flex">
                    <input id="response" type="text" placeholder="Enter answer here"/>
                    </div>
                    <div id="resp-buttons">
                    <button id="submit" type="submit">Submit</button>
                    <button id="void">Void Puzzle</button>
                    <button id="hint">Request Hint</button>
                    </div>
                </form>
                <div id="checkAnswerResult">
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>`
    let div = document.createElement('div');
    let headerBar = document.querySelector("#header-bar");
    div.innerHTML = htmlSubmit.trim();
    headerBar.appendChild(div.firstChild);
}

/// Render login if token is present, else render check answer.
function render() {
    function clearBar() {
        let headerBar = document.querySelector("#header-bar");
        for (let i = 0; i < headerBar.childElementCount - 1; i++) {
            headerBar.lastElementChild.remove();
        }
    }
    clearBar();
    if (authToken() != null) {
        showSubmit();
        document.querySelector('#checkAnswerButton')
            .addEventListener('click', renderOnSubmitOrVoided)
        document.querySelector('#checkAnswerForm')
            .addEventListener('submit', submitAnswer);
        document.querySelector('#void')
            .addEventListener('click', voidPuzzle);
        document.querySelector('#hint')
            .addEventListener('click', renderHint);
        document.querySelector('#logout')
            .addEventListener('click', logout);
        $('#checkAnswerModal')
            .on('shown.bs.modal', function () {
                console.log("FOCUSING")
                $('#checkAnswerForm input').focus();
            })
            .on('hidden.bs.modal', function () {
                resetModal();
            });
    } else {
        showLogin();
        document.querySelector('#loginForm')
            .addEventListener('submit', loginCredentials);
        $('#loginModal')
            .on('shown.bs.modal', function () {
                console.log("FOCUSING")
                $('#checkAnswerForm input').focus();
            })
            .on('hidden.bs.modal', function () {
                resetModal();
            });
    }
}

function renderScore() {
    let option = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    }

    function displayPuzzleScore(scoreNumber) {
        const puzzle = document.getElementById('puzzle');
        const score = document.createElement('div');
        const scoreLabel = document.createElement('span');
        const scoreValue = document.createElement('span');

        scoreLabel.style.fontFamily = 'BlackBeard, sans-serif';
        scoreLabel.style.fontSize = '28px';
        scoreValue.style.fontFamily = 'CrimsonText-Regular, serif';
        scoreValue.style.fontSize = '27px';

        scoreLabel.innerText = 'Score: ';
        scoreValue.innerText = `${scoreNumber} pts`;

        score.appendChild(scoreLabel);
        score.appendChild(scoreValue);

        puzzle.prepend(score);
    }

    fetch(`https://nusmsl.com/api/puzzle/${puzzleName()}`, option)
        .then((res) => res.json())
        .then((score) => {
            displayPuzzleScore(score);
        });
}

function renderOnSubmitOrVoided(event) {
    event.preventDefault()
    let option = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken()}`,
        }
    }
    let puzzleId = $('#checkAnswerModal').attr('data-puzzle-id')
    fetch(`https://nusmsl.com/api/solves/${puzzleId}`, option)
        .then((res) => res.json())
        .then((data) => {
            if (data.solve) {
                $('#checkAnswerForm :input').prop('disabled', true)
                document.getElementById("dialog_content").innerHTML =
                    `Your team has solved this puzzle. The answer is \"${data.answer}\".`
            } else if (data.void) {
                $('#checkAnswerForm :input').prop('disabled', true)
                document.getElementById("dialog_content").innerHTML =
                    `Your team has voided this puzzle. The answer is \"${data.answer}\".`
            } else {
                document.getElementById("lengthHint").innerHTML = printLengthHint(data.hint)
                document.getElementById("numHints").innerHTML = `Your team has ${data.num_hints} hint credit(s) left.`

                if (data.num_hints <= 0) {
                    $('#hint').prop('disabled', true);
                }
            }
        })
    fetch(`https://nusmsl.com/api/puzzle/hints/${puzzleId}`, option)
        .then((res) => res.json())
        .then((data) => {
            if (data.hint) {
                $('#hint').prop('disabled', true);
                $('#checkAnswerResult').removeClass('correct').removeClass('incorrect')
                    .text(`${data.hint}`)
            }
        })
}

function printLengthHint(arrNum) {
    let result = 'Answer: '
    // This line apparently does not work with older browsers, but heh
    arrNum.forEach((ele) => { result += '_ '.repeat(ele) + '&nbsp;&nbsp;&nbsp;' })
    return result.substr(0, result.length - 18)
}

/// Submit event for login
// Send login data to /api/login and receive a JWT token, which we store in localStorage.
function loginCredentials(event) {
    event.preventDefault();
    let teamName = $("#loginForm input[type='text']").val();
    let password = $("#loginForm input[type='password']").val();
    let data = {
        team: teamName,
        password: password
    }
    let option = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };
    resetModal();
    $('#loginForm button').prop('disabled', true);
    fetch('https://nusmsl.com/api/team', option)
        .then((res) => res.json())
        .then((data) => {
            if (data.message) {
                let loginResult = document.getElementById('loginResult');
                loginResult.textContent = 'Login failed.';
                loginResult.classList.add('incorrect');
                $('#loginForm button').prop('disabled', false);
            } else {
                localStorage.setItem("token", data.token);
                localStorage.setItem('groupName', teamName);
                location.reload();
            }
        })
        .catch((err) => {
            console.log(err);
            let loginResult = document.getElementById('loginResult');
            err.msg
                ? loginResult.textContent = err.msg
                : loginResult.textContent = 'Login failed.';
            loginResult.classList.add('incorrect');
            $('#loginForm button').prop('disabled', false);
        })
}

function renderHint(event) {
    event.preventDefault();

    let data = {
        puzzle: $('#checkAnswerModal').attr('data-puzzle-id')
    }

    let option = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken()}`,
        }
    }

    $('#hint').prop('disabled', true)
    fetch('https://nusmsl.com/api/puzzle/hints', option)
        .then((res) => res.json())
        .then((data) => {
            if (data.hint) {
                $('#numHints').text(`Your team has ${data.num_hints} hint credit(s) left.`);
                $('#checkAnswerResult').removeClass('correct').removeClass('incorrect')
                    .text(`${data.hint}`);
            } else if (data.message) {
                $('#checkAnswerResult').addClass('incorrect').text(`${data.message}`);
            }
        }).catch((error) => {
            console.log(error);
            $('#hint').prop('disabled', false);
        })
}

function voidPuzzle(event) {
    event.preventDefault();

    let data = {
        team: groupName(),
        puzzle: $('#checkAnswerModal').attr('data-puzzle-id')
    };

    $('#checkAnswerForm :input').prop('disabled', true);

    let option = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken()}`,
        }
    }

    fetch('https://nusmsl.com/api/puzzle/void', option)
        .then((res) => res.json())
        .then((data) => {
            if (data.answer) {
                $('#checkAnswerResult').removeClass('correct').removeClass('incorrect')
                    .text(`Your team has voided this puzzle. The answer is \"${data.answer}\".`);
            } else if (data.state) {
                $('#checkAnswerResult').removeClass('correct').removeClass('incorrect')
                    .text(`${data.state}`);
            } else if (data.message) {
                $('#checkAnswerResult').removeClass('correct').removeClass('incorrect')
                    .text(`${data.message}`);
                $('#checkAnswerForm :input').prop('disabled', false); // error dy gg
            }
        }).catch((err) => {
            console.log(err);
            $('#checkAnswerForm :input').prop('disabled', false);
        });
}

/// Submit event for check answer
function submitAnswer(event) {
    event.preventDefault();

    let data = {
        puzzle: $('#checkAnswerModal').attr('data-puzzle-id'),
        answer: $('#checkAnswerForm input').val()
    };

    resetModal();
    $('#response').prop('disabled', true)
    $('#submit').prop('disabled', true)
    $('#void').prop('disabled', true)

    let option = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken()}`,
        }
    }

    fetch('https://nusmsl.com/api/solves', option)
        .then((res) => res.json())
        .then((data) => {
            if (data.solve === true) {
                $('#checkAnswerResult')
                    .text('Correct!')
                    .addClass('correct');
                $('#checkAnswerForm :input').prop('disabled', true)
            } else if (data.solve === false) {
                $('#checkAnswerResult')
                    .text('Incorrect.')
                    .addClass('incorrect');
                $('#response').prop('disabled', false)
                $('#submit').prop('disabled', false)
                $('#void').prop('disabled', false)
            } else if (data.state) {
                $('#checkAnswerResult').removeClass('correct').removeClass('incorrect')
                    .text(`${data.state}`);
                $('#hint').prop('disabled', true);// disable everything, the case when the puzzle is solved or voided
            } else if (data.message) {
                $('#checkAnswerResult').removeClass('correct').removeClass('incorrect')
                    .text(`${data.message}`);
                $('#response').prop('disabled', false)
                $('#submit').prop('disabled', false)
                $('#void').prop('disabled', false)
            }
        }).catch((err) => {
            console.log(err)
        });
}
/// Remove token from localStorage and logout
function logout(event) {
    event.preventDefault();
    localStorage.removeItem('token');
    location.reload();
}
/// SignUp to be implemented
function signUp(event) {
    event.preventDefault();
    let teamName = $("#loginForm input[type='text']").val();
    let password = $("#loginForm input[type='password']").val();
    let data = {
        name: teamName,
        password: password
    }
    let option = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };
    resetModal();
    fetch('https://nusmsl.com/api/signup', option)
        .then((res) => res.json())
        .then((data) => {
            // TODO: help
        })
        .catch((err) => {
            // TODO: help
        });
}

document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
        renderScore();
        render(); // entry point
    }
}
