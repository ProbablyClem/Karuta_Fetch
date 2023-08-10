const cardTemplate = document.querySelector('#cardTemplate');
const cardShelf = document.querySelector('#cardShelf');

const inputName = document.querySelector("#inputName");
const inputSerie = document.querySelector("#inputSerie");
const datalistSeries = document.querySelector("#listSeries");
const inputEdition = document.querySelector("#inputEdition");
const inputQuality = document.querySelector("#inputQuality");
const inputTag = document.querySelector("#inputTag");

let cards = [];
let listSeries = [];
let listTags = [];
let tagCount = {};

const copyNotification = document.getElementById('copyNotification')
const bootstrapNotification = bootstrap.Toast.getOrCreateInstance(copyNotification)

function copyCardCode(cardCode) {
    navigator.clipboard.writeText(cardCode);
    bootstrapNotification.show()
}

function readCSVFile() {
    const files = document.querySelector('#file').files;

    if (files.length > 0) {
        cardShelf.childNodes = new Array();
        const file = files[0];

        const reader = new FileReader();
        reader.readAsText(file);

        reader.onload = function(event) {
            const csvdata = event.target.result;
            const rowData = csvdata.split('\n');
            const cols = rowData[0].split('","')
            cols[0] = cols[0].substring(1);
            cols[cols.length-1] = cols[cols.length-1].substring(0, cols[cols.length-1].length - 1);
            
            cards = [];
            listSeries = [];
            datalistSeries.innerHTML = "";
            listTags = [];
            tagCount = {};
            inputTag.innerHTML = "";

            for (let row = 1; row < rowData.length; row++) {
                const splittedInfos = rowData[row].split('","')
                splittedInfos[0] = splittedInfos[0].substring(1);
                splittedInfos[splittedInfos.length-1] = splittedInfos[splittedInfos.length-1].substring(0, splittedInfos[splittedInfos.length-1].length - 1);

                let cardInfos = {};
                for(let i = 0; i < cols.length; i++) {
                    cardInfos[cols[i]] = splittedInfos[i];
                }

                cards.push(cardInfos);
                if (!listSeries.includes(cardInfos.series)) {
                    listSeries.push(cardInfos.series);
                }
                if (!listTags.includes(cardInfos.tag)) {
                    listTags.push(cardInfos.tag);
                    tagCount[cardInfos.tag] = 1;  
                } else {
                    tagCount[cardInfos.tag]++;  
                }
            }

            listSeries.sort();
            listSeries.forEach(serie => {
                let option = document.createElement("option");
                option.innerText = serie;
                datalistSeries.appendChild(option);
            });
            listTags.sort();
            ["$all"].concat(listTags).forEach(tag => {
                let option = document.createElement("option");
                switch (tag) {
                    case "$all":
                        option.value = "$all"
                        option.innerText = "Tous";
                        break;
                    case "":
                        option.value = ""
                        option.innerText = "None";
                        break;
                    default:
                        option.value = tag
                        option.innerText = `${tag} (${tagCount[tag]})`;
                }
                inputTag.appendChild(option);
            });

            document.querySelector("#showCardsBtn").classList.remove("d-none")
            document.querySelector("#filters").classList.remove("d-none")

            displayCards();
        };
    } else {
        alert("Selectionnez un fichier");
    }
}

function displayCards() {
    document.querySelector("#cards").classList.remove("d-none")
    cardShelf.innerHTML = '';
    
    var cardList = [...cards].sort((a,b) => {
        switch (document.querySelector("#inputOrder").value) {
            case "date-asc":
                return a.obtainedTimestamp - b.obtainedTimestamp;
            case "date-desc":
                return b.obtainedTimestamp - a.obtainedTimestamp;
            case "gold-asc":
                return a.burnValue - b.burnValue;
            case "gold-desc":
                return b.burnValue - a.burnValue;
            case "name-asc":
                return a.character.localeCompare(b.character);
            case "name-desc":
                return b.character.localeCompare(a.character);
            case "serie-asc":
                return a.series.localeCompare(b.series);
            case "serie-desc":
                return b.series.localeCompare(a.series);
            case "wishlist-asc":
                return a.wishlists - b.wishlists;
            case "wishlist-desc":
                return b.wishlists - a.wishlists;
            default:
                return 1;
        }
    });

    cardList.forEach(cardInfos => {
        if (!cardInfos.character.toLowerCase().includes(inputName.value.toLowerCase())) {
            return;
        }
        if (!cardInfos.series.toLowerCase().includes(inputSerie.value.toLowerCase())) {
            return;
        }
        if (inputEdition.value != "$all" && cardInfos.edition != inputEdition.value) {
            return;
        }
        if (inputQuality.value != "$all" && cardInfos.quality != inputQuality.value) {
            return;
        }
        if (inputTag.value != "$all" && cardInfos.tag != inputTag.value) {
            return;
        }

        let card = document.importNode(cardTemplate.content, true);
        // character name
        card.querySelector("[data=picture]").src = `https://d2l56h9h5tj8ue.cloudfront.net/images/cards/${formatCharacterName(cardInfos.character)}-${cardInfos.edition}.jpg`;
        card.querySelector("[data=picture]").alt = cardInfos.character;
        // character name + serie
        card.querySelector("[data-info=fallbackPicture]").data = `https://d2l56h9h5tj8ue.cloudfront.net/images/cards/${formatCharacterName(cardInfos.character + " " + cardInfos.series)}-${cardInfos.edition}.jpg`;
        card.querySelector("[data-info=fallbackPicture]").alt = cardInfos.character;

        card.querySelector("[data=name]").innerText = cardInfos.character;
        card.querySelector("[data=serie]").innerText = cardInfos.series;

        switch (cardInfos.quality) {
            case "0":
                card.querySelector("[data=quality]").innerText = "☆☆☆☆ Damaged"
                card.querySelector("[data=quality]").classList.add("text-bg-danger");
                break;
            case "1":
                card.querySelector("[data=quality]").innerText = "★☆☆☆ Poor"
                card.querySelector("[data=quality]").classList.add("text-bg-warning");
                break;
            case "2":
                card.querySelector("[data=quality]").innerText = "★★☆☆ Good"
                card.querySelector("[data=quality]").classList.add("text-bg-secondary");
                break;
            case "3":
                card.querySelector("[data=quality]").innerText = "★★★☆ Excellent"
                card.querySelector("[data=quality]").classList.add("text-bg-primary");
                break;
            case "4":
                card.querySelector("[data=quality]").innerText = "★★★★ Mint"
                card.querySelector("[data=quality]").classList.add("text-bg-success");
                break;
            default:
                card.querySelector("[data=quality]").innerText = cardInfos.quality
                card.querySelector("[data=quality]").classList.add("text-bg-dark");
        }
        card.querySelector("[data=edition]").innerText = "◈" + cardInfos.edition + " (Edition)";
        card.querySelector("[data=number]").innerText = "#" + cardInfos.number + " (Print)";
        card.querySelector("[data=code]").innerText = cardInfos.code;
        card.querySelector("[data=code]").addEventListener("click", () => copyCardCode(cardInfos.code));
        card.querySelector("[data=tag]").innerText = cardInfos.tag == "" ? "None" : cardInfos.tag;
        card.querySelector("[data=wishlist]").innerText = cardInfos.wishlists;
        card.querySelector("[data=value]").innerText = cardInfos.burnValue;
        card.querySelector("[data=obtention]").innerText = new Date(parseInt(cardInfos.obtainedTimestamp)).toLocaleString();
        cardShelf.appendChild(card);

    });
    return false;
}

const formatCharacterName = (name) => {
    return name.toLowerCase()
        .replaceAll(" - ", " ")
        .replaceAll(" ", "-")
        .replaceAll("(", "")
        .replaceAll(")", "")
        .replaceAll("'", "")
        .replaceAll(":", "")
        .replaceAll(";", "")
        .replaceAll(".", "")
        .replaceAll(",", "")
        .replaceAll("&", "")
        .replaceAll("?", "")
}