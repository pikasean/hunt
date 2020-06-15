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
            .on('shown.bs.modal', function() {
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
            .on('shown.bs.modal', function() {
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
    console.log(data);
    console.log(option);
    resetModal();
    fetch('https://nusmsl.com/api/login', option)
        .then((res) => res.json())
        .then((data) => {
            sessionStorage.setItem("token", data.token);

            location.reload();
        })
        .catch((err) => {
            console.log(err)
            let loginResult = document.getElementById('loginResult');
            err.msg
                ? loginResult.textContent = err.msg
                : loginResult.textContent = 'Login failed.';
            loginResult.classList.add('incorrect');
        })
}
/// Submit event for check answer
// Do answer check on front end and send puzzleName to /api/solve along with token.
function submitAnswer(event) {
    event.preventDefault();
    let answer = $('#checkAnswerForm input').val();
    let puzzleId = $('#checkAnswerModal').attr('data-puzzle-id');

    let result = checkAnswer(puzzleId, answer);
    resetModal();

    if (result.correct) {
        let data = {
            puzzleName: puzzleId
        }
        let option = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken()}`,
            }
        };
        fetch('https://nusmsl.com/api/solve', option)
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err)
            })
            .finally(() => {
                $('#checkAnswerResult')
                    .text('Correct!')
                    .addClass('correct');
            });
    } else if (result.message) {
        $('#checkAnswerResult')
            .text(result.message)
            .addClass('incorrect');
    } else {
        $('#checkAnswerResult')
            .text('Incorrect.')
            .addClass('incorrect');
    }
}

/// TODO: Change according to our puzzle lists
let answerHashCodes = {"the_treehouse_of_crossed_destinies":140740826,"7_little_dropquotes":979642562,"just_desserts":-1366572129,"romance_languages":24777476,"a_mysterious_event":1701835862,"invisible_walls":1314192651,"opposites_attract":1300806583,"poor_richard_goes_to_sea":-2095683739,"marching_band":793607814,"the_obligatory_g_s_puzzle":92734181,"ore_aft":-878646593,"playing_a_round":-429161605,"true_and_false_2":-900885449,"protection_plan":2759337,"moral_ambiguity":-56969010,"fame_is_fleeting":-260659066,"tree_ring_circus":1911930386,"the_lives_of_pi":-510014407,"the_missing_piece_meets_the_big_o":923079610,"events":934742303,"be_mine":1407787855,"activities_midway":-618415706,"itishuntyes":-1895488869,"comma_and_a_freaking_dot":-892571473,"schematics":-976935344,"fake_ids":-986596886,"travelogue":64611,"new_years_holi":-1027277437,"turn_on_a_dime":-605282132,"standardized_mess":-42539029,"deep_blue":-628323464,"broken_concentration":-2067444630,"shah_raids":714419163,"chain_of_commands":1640315734,"a_bunch_of_ripoffs":1849007217,"concrete":-1998146179,"playing_bootsie":-1545800717,"caressing":1029195582,"hes_out":1068886189,"polyphony":-439590593,"gone_guys":-1436187442,"sage_advice":544528138,"compass_and_straightedge":-53157345,"clued_connections":-2125089936,"american_icons":285401178,"hearing_test":1984421584,"talk_like_a_pirate_day":1496961575,"listomania":1782528429,"bloom_filter":-1835969383,"split_seven_ways":-82901673,"keeping_tabs":356420017,"picture_book":87751,"twisty_passages":85711,"fake_estate":-1697001880,"letters_from_the_battlefield":1980261421,"i_cant_deal_with_these_endless_numbers":-956511122,"movie_marathon":459190334,"divine_the_rule_of_kings":1974387681,"cubic":1979185939,"mathematical":-804710613,"halloween_valentines_day":522785458,"diplomatic_cables":297839267,"drop_and_give_me_ten":-2056763292,"small_steps":433888566,"martin_luther_king_jr_day":634620942,"flag_day":-435038014,"pass_da_pasta":-1257800509,"arbor_day_bloomsday":2006960992,"cross_campus":-882135150,"side_dishes":1271751612,"if_at_first_you_dont_succeed":-387545826,"herbert_west_animator":-1816457097,"dk8_the_turducken_konundrum_turkey":1324247135,"your_wish_is_my_command":2520878,"valentines_day_arbor_day":729101936,"chris_chros":1146432766,"chicago_loop":792805237,"battle_of_the_network_stars":1060474840,"bee_movies":1921961325,"travel_planning":2431971,"connect_four":-1306944268,"ridin_delhi":-142972925,"registration_day":-688183725,"have_you_seen_me":683046309,"something_in_common":-1839377263,"thanksgiving_new_years":-817808190,"rules_of_order":1231567103,"circulatory_system":2048567090,"watercolors":-1137992886,"climate_change":219318563,"a_good_walk_spoiled":1675064046,"riding_the_tube":1421753640,"things":1928056442,"would_not_make_again":-1504527570,"groundhog_day":-342592494,"april_fools_day":343055479,"chowing_down":70950,"display_case":-2024795421,"new_years_patriots_day":153662562,"complementary_copies":-1222872379,"the_sound_of_music":743714956,"bubbly":-1124616420,"in_syndication":110912504,"taskmaster":1643614250,"loaded":1747708917,"twelve_eleven":-1681105121,"quaternary_structure":-1897516120,"ipod_submarine":-631443423,"delightful":-207758267,"art_tours":-1455793820,"poetic_license":-848881671,"ornaments":-261656435,"first_you_visit_burkina_faso":-1895385569,"nobel_laureate":71183367,"gif_of_the_magi":1693696955,"holi_pi_day":1884529499,"valentines_day_presidents_day":545408909,"twitterati":1049068392,"tough_enough":1935150707,"engelsche":1326313994,"middle_school_of_mines":-1397720871,"touring_the_nation":1502971720,"flocks":-72031603,"mountains_and_valleys":72790390,"deeply_confused":-1602494563,"holi_patriots_day":-53341013,"far_out":126147910,"radio_play":923653965,"no_sads":-1899396724,"binary_search":575992341,"common_flavors":-685342048,"christmas_halloween":1966024724,"fish_puzzles":-743652658,"youre_gonna_need_a_bigger_gravy_boat":211549071,"furious_fellows":552401794,"bitter_kittens_cross_the_pond":-1814867475,"a_lemon_tree":77297,"funkin":-53994186,"crosscut":-1745725788,"stuffing":692465291,"wait_for_it":-1418496715,"a_tearable_puzzle":-726003616,"we_see_thee_rise":37136232,"jukebox_hero":2084687104,"dampfwalze":1965172667,"i_am_groot":359024581,"hexed_adventure_ii_hexed_again":-1091222961,"pi_day_bloomsday":1039881612,"arbor_day_pi_day":-73746398,"rose_garden":-1252010306,"peripathetic":-1731056353,"turtle_power":-1763106601,"thanksgiving_presidents_day":772275892,"insider_trading":-238976010,"costume_change":2068793921,"state_machine":61297414,"haunted":135796204,"helvetica_is_only_an_okay_font":-699628241,"some_kind_of_monster":-944973929,"place_settings":-379671819,"send_yourself_swanlumps":63294520,"no_shirt":55041416,"uncommon_bonds":-525928332,"the_bill":1476182307,"making_a_difference":904571332,"compromised":-423957817,"starbucks_lover":1443817174,"halloween_thanksgiving":-323925433,"running_for_office":1512897156,"safety_training":-1273522857,"spinning_tops":-1855777539,"joke_o_lantern":-575348236,"tales_from_the_crypt":-1900057025,"lantern_festival":953739715,"theater_pieces":1627540315,"i_knew_weird_al_yankovic_and_you_sir_are_no_weird_al_yankovic":1609429659,"badges_badges_badges":-1660934303,"a_killer_party":-1498434767,"unpleasant_characters":2060991186,"a_vexing_puzzle":-827223505,"anima_oratorio":-901096797,"date_and_thyme":-1993852740,"getting_digits":1782528429}
let instructionHashCodes = {"a_bunch_of_ripoffs":1135991751,"a_generic_family_portrait":1243481611,"american_icons":-559272520,"anima_oratorio":-901096797,"a_tearable_puzzle":-1406060527,"comma_and_a_freaking_dot":555666529,"common_flavors":-721086787,"date_and_thyme":-1993852740,"funkin":2069886902,"itishuntyes":146090855,"send_yourself_swanlumps":436429980,"taskmaster":700204925,"theater_pieces":1474198682,"the_obligatory_g_s_puzzle":694905241,"travel_planning":637154526,"turn_on_a_dime":1012061987};

/// checkAnswer BlackBox (Not touching)
function checkAnswer(puzzleId, submission) {
    let answerHashCode = answerHashCodes[puzzleId];
    if (answerHashCode === undefined) {
        return { correct: false, message: null };
    }
    let instructionHashCode = instructionHashCodes[puzzleId];

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

    if (submissionHashCode === instructionHashCode) {
        return { correct: false, message: "Correct instruction, but not final answer." }
    }

    return { correct: false, message: null };
}

document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
        render(); // entry point
    }
}
