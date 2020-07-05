/// Retrieve token.
// If token is present, we will render the submit page, else the login page.
let authToken = () => localStorage.getItem('token');
let groupName = () => localStorage.getItem('groupName');

function renderTeamProgress() {
    let option = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken()}`,
        }
    }

    function displayPuzzleSolvedOrVoided(puzzle_id, state) {
        // state === 'V' or 'S'
        const puzzle = document.getElementById(puzzle_id);
        const span = puzzle.firstElementChild;
        const img = span.firstElementChild;

        if (state === 'V') {
            img.src = 'assets/icons/voided.png';
            img.style.opacity = "1";
        } else if (state === 'S') {
            img.src = 'assets/icons/solved.png';
            img.style.opacity = "1";
        }
    }

    fetch('https://nusmsl.com/api/team', option)
        .then((res) => res.json())
        .then((data) => {
            const {progress} = data;
            for (const {puzzle_id, state} of progress) {
                displayPuzzleSolvedOrVoided(puzzle_id, state);
            }
        })
}

/// HTML for login
function showLogin() {
    const htmlLogin = `
        <div class="header-links">
          <div id="login" class="header-link">
            <a href="puzzle.html#" data-toggle="modal" data-target="#loginModal">Login</a>
          </div>


          <div class="modal fade" id="loginModal" tabindex="-1" role="dialog" aria-labelledby="loginModalLabel"
               data-puzzle-id="puzzle">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span>
                  </button>
                  <span class="modal-title" id="loginModalLabel">Enter your team name and password</span>
                </div>
                <div class="modal-body">
                  <form id="loginForm" action="puzzle.html#">
                    <input type="text" placeholder="Username"/><br>
                    <input type="password" placeholder="Password"/><br>
                    <button type="submit">Login</button>
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
function showWelcome() {
    let group = groupName();
    let welcomeDescription = group === null ? 'Welcome!' : `Welcome, ${group}!`;
    const htmlSubmit = `
        <div class="header-links">
          <div id="welcome" class="header-dropdown-title"><a href="puzzle.html#">${welcomeDescription}<span class="fas fa-caret-down"></span></a></div>
            <div class="dropdown-content-wrapper">
                <div class="dropdown-link" id="logout">
                    Logout
                </div>
            </div>
        </div>`
    let div = document.createElement('div');
    let headerBar = document.querySelector("#header-bar");
    div.innerHTML = htmlSubmit.trim();
    headerBar.appendChild(div.firstChild);
}

/// Submit event for login
// Send login data to /api/login and receive a JWT token, which we store in localStorage.
function renderLoginOrWelcome() {
    function clearBar() {
        let headerBar = document.querySelector("#header-bar");
        for (let i = 0; i < headerBar.childElementCount - 1; i++) {
            headerBar.lastElementChild.remove();
        }
    }
    clearBar();
    if (authToken() != null) {
        showWelcome();
        document.querySelector('#logout')
            .addEventListener('click', logout);
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
                $('#loginForm button').prop('disabled', false);
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
        renderTeamProgress(); // entry point
        renderLoginOrWelcome();
    }
}