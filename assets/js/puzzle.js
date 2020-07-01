/// Retrieve token.
// If token is present, we will render the submit page, else the login page.
let authToken = () => sessionStorage.getItem('token');
let groupName = () => sessionStorage.getItem('groupName');
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
function showSubmit() {
    let puzzle = puzzleName();
    let group = groupName();
    let welcomeDescription = group === null ? 'Welcome!' : `Welcome, ${group}!`;
    const htmlSubmit = `
        <div class="header-links">
          <div id="check_answer" class="header-link"><a href="${puzzle}.html#" data-toggle="modal"
                                                    data-target="#checkAnswerModal">Submit Answer</a></div>
<!--          <div id="submit" class="header-link"><a href="../solutions/${puzzle}.html">Solution</a></div>-->
          <div id="welcome" class="header-link"><a href="../leaderboard.html" >${welcomeDescription}</a></div>
          

          <div class="modal fade" id="checkAnswerModal" tabindex="-1" role="dialog" aria-labelledby="checkAnswerModalLabel"
               data-puzzle-id="${puzzle}">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span>
                  </button>
                  <span class="modal-title" id="checkAnswerModalLabel">Submit Answer</span>
                </div>
                <div class="modal-body">
                  <form id="checkAnswerForm" action="${puzzle}.html#">
                    <input type="text" placeholder="Enter answer here"/><br>
                    <button type="submit">Submit</button>
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
        document.querySelector('#checkAnswerForm')
            .addEventListener('submit', submitAnswer);
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

/// Submit event for login
// Send login data to /api/login and receive a JWT token, which we store in sessionStorage.
function loginCredentials(event) {
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
    $('#loginForm button').prop('disabled', true);
    fetch('https://nusmsl.com/api/login', option)
        .then((res) => res.json())
        .then((data) => {
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem('groupName', teamName);
            location.reload();
            $('#loginForm button').prop('disabled', false);
        })
        .catch((err) => {
            console.log(err)
            let loginResult = document.getElementById('loginResult');
            err.msg
                ? loginResult.textContent = err.msg
                : loginResult.textContent = 'Login failed.';
            loginResult.classList.add('incorrect');
            $('#loginForm button').prop('disabled', false);
        })
}
/// Submit event for check answer
// Do answer check on front end and send puzzleName to /api/solve along with token.
function submitAnswer(event) {
    event.preventDefault();
    let answer = $('#checkAnswerForm input').val();
    let puzzleId = $('#checkAnswerModal').attr('data-puzzle-id');
    let team = groupName();

    let data = { team, puzzleId, answer }

    resetModal();
    $('#checkAnswerForm button').prop('disabled', true);

    let option = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken()}`,
        }
    }

    fetch('https://nusmsl.com/api/solve', option)
        .then((res) => res.json())
        .then((data) => {
            if (data.solve) {
                $('#checkAnswerResult')
                    .text('Correct!')
                    .addClass('correct');
            } else {
                $('#checkAnswerResult')
                    .text('Incorrect.')
                    .addClass('incorrect');
            }
            $('#checkAnswerForm button').prop('disabled', false);
        }).catch((err) => {
            console.log(err)
        });
}
/// Remove token from sessionStorage and logout
function logout(event) {
    event.preventDefault();
    sessionStorage.removeItem('token');
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



let answerHashCodes = {
    '12_pictures': 1805564616, 'alpha_helix': -719975452, 'are_you_satisfactory_enough': -18080859, 'basic': 956486952, 'biz_fos': 2086097974, 'biz_soc': 1951950692, 'broken_messages': 83934, 'cat_emojis': 122794406, 'cca_sharing': -665682260, 'central_library': 1299076926, 'character_double': 987737024, 'covid_19': 171806750, 'elementary': 65954, 'engin_yst': 1993440030, 'fass_engin': -1102720003, 'fass_soc': 2024518163, 'fos_yst': 1987167862, 'framing_differences': 1159194214, 'gee_square_pies': -435389283, 'helix': -1671081370, 'i_am_groot': -254552085, 'imdb': -108252542, 'it_all_adds_up': -1941910498, 'just_like_me': 416618591, 'leftover_dice': 1942336857, 'magiball': -1809054862, 'mala_stalls': 1560527756, 'malaysian_students_league': -996010050, 'mashup': 2020651482, 'modreg': 166265618, 'mountains_and_valleys': 88837, 'mr_lemons': 2336508, 'mrt_tracing': -1971285197, 'music_box': 1691559318, 'peaks': 67260617, 'polypotions': -105691978, 'punzle': 2022138428, 'puzzle_10': -362898206, 'qet_briefing': 1595145549, 'qet_marking': 2119594319, 'reddit': 68912562, 'safety_first': -340597151, 'solfa': 1721290109, 'special_characters': -60766767, 'the_club': 122240367, 'the_committee': -1011476439, 'the_heist': 472343990, 'the_traveller': 1032525434, 'things': 674396804, 'triangles_everywhere': 1263663902, 'utown': 483966670,
    'waiting_for_d2': 1980522540,
    'what_does_the_owl_say': -1189163521
};

/// checkAnswer BlackBox (Not touching)
function checkAnswer(puzzleId, submission) {
    let answerHashCode = answerHashCodes[puzzleId];
    if (answerHashCode === undefined) {
        return { correct: false, message: null };
    }

    let strippedSubmission = submission.toUpperCase().replace(/[^A-Z0-9]/g, "");
    let submissionHashCode = 0;
    for (let i = 0; i < strippedSubmission.length; i++) {
        let char = strippedSubmission.charCodeAt(i);
        submissionHashCode = ((submissionHashCode << 5) - submissionHashCode) + char;
        submissionHashCode = submissionHashCode & submissionHashCode;
    }

    if (submissionHashCode === answerHashCode) {
        return { correct: true, message: null };
    }

    return { correct: false, message: null };
}

document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
        render(); // entry point
    }
}
