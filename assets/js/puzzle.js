function render() {
    clearBar();
    if (authToken() != null) {
        showSubmit();
        document.querySelector('#checkAnswerForm')
            .addEventListener('submit', submitAnswer);
    } else {
        showLogin();
        document.querySelector('#loginForm')
            .addEventListener('submit', loginCredentials);
    }
}

let authToken = () => localStorage.getItem('token');

function clearBar() {
    let headerBar = document.querySelector("#header-bar");
    for (let i = 0; i < headerBar.childElementCount - 1; i++) {
        headerBar.lastElementChild.remove();
    }
}

function showLogin() {
    const htmlLogin = `
        <div class="header-links">
          <div id="login" class="header-link">
            <a href="12_pictures.html#" data-toggle="modal" data-target="#loginModal">Login</a>
          </div>


          <div class="modal fade" id="loginModal" tabindex="-1" role="dialog" aria-labelledby="loginModalLabel"
               data-puzzle-id="12_pictures">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span>
                  </button>
                  <span class="modal-title" id="loginModalLabel">Enter your team name and password</span>
                </div>
                <div class="modal-body">
                  <form id="loginForm" action="12_pictures.html#">
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

function showSubmit() {
    const htmlSubmit = `
        <div class="header-links">
          <div id="check_answer" class="header-link"><a href="12_pictures.html#" data-toggle="modal"
                                                    data-target="#checkAnswerModal">Check Answer</a></div>
          <div id="submit" class="header-link"><a href="../solutions/12_pictures.html">Solution</a></div>


          <div class="modal fade" id="checkAnswerModal" tabindex="-1" role="dialog" aria-labelledby="checkAnswerModalLabel"
               data-puzzle-id="12_pictures">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span>
                  </button>
                  <span class="modal-title" id="checkAnswerModalLabel">Check Answer</span>
                </div>
                <div class="modal-body">
                  <form id="checkAnswerForm" action="12_pictures.html#">
                    <input type="text" placeholder="Enter answer here"/><br>
                    <button type="submit">Check</button>
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

function loginCredentials(event) {
    event.preventDefault();
    let teamName = document.querySelector("#loginForm input[type='text']").value;
    let password = document.querySelector("#loginForm input[type='password']").value;
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
    console.log(data);
    console.log(option);

    fetch('https://nusmsl.com/api/login', option)
        .then((res) => res.json())
        .then((data) => {
            localStorage.setItem("token", data.token);
            render(); // render if successful login
        })
        .catch((err) => {
            console.log(err)
        });
}

function submitAnswer(event) {
    event.preventDefault();
    let answer = document.querySelector("#checkAnswerForm input").value;

    // Check Answer from solution.js (handle afterwards)
    if (answer.isCorrect()) {
        let data = {
            token: authToken(),
            puzzleName: '12_pictures'
        }
        let option = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };
        fetch('https://nusmsl.com/api/solve', option)
            .then((res) => res.json())
            .then((data) => {
                // receive groupData.group from API
            })
            .catch((err) => {
                console.log(err)
            });
    } else {
        // follow solution.js error handling whatever
    }
}

render(); // entry point