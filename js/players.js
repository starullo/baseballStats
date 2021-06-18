'use strict';

let playerId;
let playerName;

// event handlers

const handleSearchPlayers = async e => {
    const pList = !document.querySelector(".players-list") ? document.createElement("div") : document.querySelector(".players-list");
    const display = !document.querySelector(".display") ? document.createElement("div") : document.querySelector(".display");
    const displayedStats = !document.querySelector(".displayed-stats") ? document.createElement("div") : document.querySelector(".displayed-stats");
    pList.innerHTML = "";
    display.innerHTML = "";
    displayedStats.innerHTML = "";
    axios.get(`https://baseballwow.herokuapp.com/http://lookup-service-prod.mlb.com/json/named.search_player_all.bam?sport_code='mlb'${finishUrl(e.target)}`)
    .then(res=>{
        const results = res.data.search_player_all.queryResults.row;
        const resultCount = Number(res.data.search_player_all.queryResults.totalSize);
        console.log(res)
        if (resultCount > 1) {
            addPlayersToPage(results);
        } else if (resultCount === 1) {
            addPlayerToDisplay(results);
        }
    })
    .catch(err=>{
        clearPlayerSearchResults();
        const playerInfo = document.querySelector(".players-list");
        playerInfo.innerText = "No results found";
    })
}

const handlePlayerNameClick = e => {
    clearPlayerSearchResults();
    axios.get(`https://baseballwow.herokuapp.com/http://lookup-service-prod.mlb.com/json/named.player_info.bam?sport_code='mlb'&player_id=${Number(e.target.id)}`)
    .then(res=>{
        const player = res.data.player_info.queryResults.row;
        addPlayerToDisplay(player);
    })
    .catch(err=>{
        const playerDisplay = clearPlayerDisplay();
        playerDisplay.innerText = "No results found";
    })
}

const handleHittingSubmit = e => {
    const div = !document.querySelector(".displayed-stats") ? document.createElement("div") : document.querySelector(".displayed-stats");
    div.innerHTML = "";
    const year = document.querySelector("#year").value;
    axios.get(`https://baseballwow.herokuapp.com/http://lookup-service-prod.mlb.com/json/named.sport_hitting_tm.bam?league_list_id='mlb'&game_type='${"R"}'&season='${year}'&player_id='${playerId}'`)
    .then(res=>{
        console.log(res);
        const resultLength = res.data.sport_hitting_tm.queryResults.totalSize;
        if (resultLength === "1") {
            displayStats(res.data.sport_hitting_tm.queryResults.row, div);
        } else {
            res.data.sport_hitting_tm.queryResults.row.forEach(obj=>{
                displayStats(obj, div);
            })
        }
    })
    .catch(err=>{
        const div = !document.querySelector(".displayed-stats") ? document.createElement("div") : document.querySelector(".displayed-stats");
        div.innerHTML = "";
        div.innerText = "No results found";
    })
}

const handlePitchingSubmit = e => {
    const div = !document.querySelector(".displayed-stats") ? document.createElement("div") : document.querySelector(".displayed-stats");
    div.innerHTML = "";
    const year = document.querySelector("#year").value;
    axios.get(`https://baseballwow.herokuapp.com/http://lookup-service-prod.mlb.com/json/named.sport_pitching_tm.bam?league_list_id='mlb'&game_type='${"R"}'&season='${year}'&player_id='${playerId}'`)
    .then(res=>{
        const stats = res.data.sport_pitching_tm.queryResults.row;
        const resultsLength = res.data.sport_pitching_tm.queryResults.totalSize;
        if (resultsLength === "1") {
            displayPitcherStats(stats, div);
        } else {
            stats.forEach(obj=>{
                displayPitcherStats(obj, div)
            })
        }
  
    })
    .catch(err=>{
        const div = !document.querySelector(".displayed-stats") ? document.createElement("div") : document.querySelector(".displayed-stats");
        div.innerHTML = "";
        div.innerText = "No results found";
    })
}

const handleSelectYearOnChange = e => {
    const year = Number(e.target.value);
    const dropdown = document.querySelector("#year");
    const hittingSubmitButton = document.querySelector("#playerHittingSubmit");
    const pitchingSubmitButton = document.querySelector("#playerPitchingSubmit");
    hittingSubmitButton.disabled = false;
    pitchingSubmitButton.disabled = false;
    dropdown.value = year;
    
}

const addYearDropdownToDisplay = () => {
    const playerDisplayDiv = document.querySelector(".display");
    const dropdown = document.createElement("select");
    const hittingSubmitButton = document.createElement("button");
    const pitchingSubmitButton = document.createElement("button");

    dropdown.name = "year";
    dropdown.id = "year";
    dropdown.onchange = handleSelectYearOnChange;
    const option = document.createElement("option");
    option.value = null;
    option.innerText = "Select a Specific Year";
    option.disabled = true;
    option.selected = "selected";
    dropdown.appendChild(option);
    hittingSubmitButton.id = "playerHittingSubmit";
    hittingSubmitButton.onclick = handleHittingSubmit;
    hittingSubmitButton.innerText = "Batting";
    hittingSubmitButton.disabled = true;
    pitchingSubmitButton.id = "playerPitchingSubmit";
    pitchingSubmitButton.onclick = handlePitchingSubmit;
    pitchingSubmitButton.innerText = "Pitching";
    pitchingSubmitButton.disabled = true;

    const debutYear = document.querySelector("#debut").innerText.slice(-4);
    const years = getPotentialSeasonsArray(Number(debutYear));

    for (let i = 0; i < years.length; i++) {
        const year = years[i];
        const option = document.createElement("option");
        option.value = year;
        option.innerText = year;
        dropdown.appendChild(option);
    }

    playerDisplayDiv.appendChild(dropdown);
    playerDisplayDiv.appendChild(hittingSubmitButton);
    playerDisplayDiv.appendChild(pitchingSubmitButton);
    


}

// helper functions
const getSearchParamString = () => {
    const playerInput = document.querySelector("#player-input");
    const trimmed = playerInput.value.trim();
    const searchWordsArray = trimmed.split(" ").filter(x=>x);
    return searchWordsArray.length === 1 ? searchWordsArray[0] + "%25" : searchWordsArray.length > 1 ? searchWordsArray.join(" ") : " ";
}

const addPlayerToDisplay = player => {
    const playerDisplay = clearPlayerDisplay();
    playerId = player.player_id;
    playerName = player.name_display_first_last;

    const name = document.createElement("h4");
    const dob = document.createElement("p");
    const debut = document.createElement("p");
    const position = document.createElement("p");
    const bats = document.createElement("p");
    const selectYearP = document.createElement("p");

    name.innerText = player.name_display_first_last;
    dob.innerText = "Born: " + getDate(player.birth_date);
    debut.innerText = "MLB Debut: " + getDate(player.pro_debut_date);
    debut.id = "debut";
    position.innerText = player.position_id ? "Position: " + getPosition(player.position_id) : "Position: " + getPosition(player.primary_position);
    bats.innerText = "Bats: " + getRL(player.bats) + ", Throws: " + getRL(player.throws);
    selectYearP.innerText = "Select Year";

    playerDisplay.appendChild(name);
    playerDisplay.appendChild(dob);
    playerDisplay.appendChild(debut);
    playerDisplay.appendChild(position);
    playerDisplay.appendChild(bats);

    addYearDropdownToDisplay();
    

}

const addPlayersToPage = players => {

    clearPlayerSearchResults();
    const playersList = document.querySelector(".players-list");

    for (let i = 0; i < players.length; i++) {
            const curPlayer = players[i];

            const newDiv = document.createElement("div");
            const nameLink = document.createElement("a");
            const position = document.createElement("p");
            const lastTeam = document.createElement("p");
            const debut = document.createElement("p");

            nameLink.innerText = curPlayer.name_display_first_last;
            nameLink.href = "#";
            nameLink.id = Number(curPlayer.player_id);
            nameLink.onclick = handlePlayerNameClick;

            position.innerText = "Position: " + getPosition(curPlayer.position_id);

            lastTeam.innerText = "Last played for: " + curPlayer.team_full;

            const longString = players[i].pro_debut_date;
            debut.innerText = "MLB Debut: " + longString.slice(0, 4);

            newDiv.appendChild(nameLink);
            newDiv.appendChild(position);
            newDiv.appendChild(lastTeam);
            newDiv.appendChild(debut);

            playersList.appendChild(newDiv);
    }
}

const displayStats = (stats, container) => {
    const div = document.createElement("div");
    const h5 = document.createElement("h5");
    const games = document.createElement("p");
    const atBats = document.createElement("p");
    const hits = document.createElement("p");
    const walks = document.createElement("p");
    const obp = document.createElement("p");
    const slg = document.createElement("p");
    const ops = document.createElement("p");
    const avg = document.createElement("p");
    const babip = document.createElement("p");
    const homeRuns = document.createElement("p");
    const rbi = document.createElement("p");

    h5.innerHTML = stats.team_full;
    games.innerHTML = "Games Played: " + stats.g;
    atBats.innerHTML = "At-Bats: " + stats.ab;
    hits.innerHTML = "Hits: " + stats.h;
    walks.innerHTML = "Walks: " + stats.bb;
    obp.innerHTML = "On Base Percentage: " + stats.obp + "%";
    slg.innerHTML = "Slugging Percentage: " + stats.slg + "%";
    ops.innerHTML = "OPS: " + stats.ops;
    avg.innerHTML = "Batting Avg: " + stats.avg;
    babip.innerHTML = "BABIP: " + stats.babip;
    homeRuns.innerHTML = "Home Runs: " + stats.hr;
    rbi.innerHTML = "RBI: " + stats.rbi;

    div.appendChild(h5);
    div.appendChild(games);
    div.appendChild(atBats);
    div.appendChild(hits);
    div.appendChild(walks);
    div.appendChild(obp);
    div.appendChild(slg);
    div.appendChild(ops);
    div.appendChild(avg);
    div.appendChild(babip);
    div.appendChild(homeRuns);
    div.appendChild(rbi);

    container.appendChild(div);
}

const displayPitcherStats = (stats, container) => {
    const div = document.createElement("div");
    const h5 = document.createElement("h5");
    const innings = document.createElement("p");
    const k9 = document.createElement("p");
    const kBbRatio = document.createElement("p");
    const era = document.createElement("p");

    h5.innerText = stats.team_full;
    innings.innerText = "Innings Pitched: " + stats.ip;
    k9.innerText = "K/9: " + stats.k9;
    kBbRatio.innerText = "K/BB Ratio: " + stats.kbb;
    era.innerText = "ERA: " + stats.era;

    div.appendChild(h5);
    div.appendChild(innings);
    div.appendChild(k9);
    div.appendChild(kBbRatio);
    div.appendChild(era);

    container.appendChild(div);

}

const clearPlayerSearchResults = () => {
    const playersList = document.querySelector(".players-list");
    playersList.innerHTML = "";
}

const clearPlayerDisplay = () => {
    const displayedData = document.querySelector(".display");
    displayedData.innerHTML = "";
    return displayedData;
}


const finishUrl = element => {
    return `${element.id === "current" ? "&active_sw='Y'" : element.id === "former" ? "&active_sw='N'" : ""}&name_part='${getSearchParamString()}'`;
}

const getDate = string => {
    const arr = string.split("-").map((str, i)=>{
        if (i == 1) {
            return getMonth(str);
        } else if (i == 2) {
            return str.slice(0, 2);
        } else {
            return str;
        }
    });

    let month = arr[1];
    let year = arr[0];
    let day = arr[2].charAt(0) === "0" ? arr[2].charAt(1) : arr[2];

    return month + " " + day + ", " + year;
}

const getMonth = num => {
    let month;
    switch(num) {
        case "01":
            month = "January";
            break;
        case "02":
            month = "February";
            break;
        case "03":
            month = "March";
            break;
        case "04":
            month = "April";
            break;
        case "05":
            month = "May";
            break;
        case "06":
            month = "June";
            break;
        case "07":
            month = "July";
            break;
        case "08":
            month = "August";
            break;
        case "09":
            month = "September";
            break;
        case "10":
            month = "October";
            break;
        case "11":
            month = "November";
            break;
        case "12":
            month = "December";
            break;
        default:
            month = "???";
            break;
    }
    return month;
}

const getPosition = id => {
    let position;
    switch(id) {
        case "1":
            position = "Pitcher";
            break;
        case "2":
            position = "Catcher";
            break;
        case "3":
            position = "First Base";
            break;
        case "4":
            position = "Second Base";
            break;
        case "5":
            position = "Third Base";
            break;
        case "6":
            position = "Short Stop";
            break;
        case "7":
            position = "Left Field";
            break;
        case "8":
            position = "Center Field";
            break;
        case "9":
            position = "Right Field";
            break;
        default:
            position = "???";
            break;
    }
    return position;
}

const getRL = char => {
    return char === "L" ? "Left" : char === "R" ? "Right" : "???";
}

const getPotentialSeasonsArray = debutYear => {
    let yearsArray = [];
    const endYear = debutYear + 30;
    for (let i = debutYear; i <= endYear; i++) {
        yearsArray.push(i);
    }
    return yearsArray.filter(year=>year <= 2021);
}


window.onload = (() => {
    
    const playerSearchButtons = document.querySelectorAll(".player-buttons button");
    playerSearchButtons.forEach(button=>{
        button.onclick = handleSearchPlayers;
    })

});