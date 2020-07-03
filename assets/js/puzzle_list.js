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
        // TODO (SEAN): toggle solved or void logo
        // state === 'V' or 'S'
        const puzzle = document.getElementById(`#${puzzle_id}`);
        if (state === 'V') {
            // display void
        } else if (state === 'S') {
            // display tick
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


document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
        renderTeamProgress(); // entry point
    }
}