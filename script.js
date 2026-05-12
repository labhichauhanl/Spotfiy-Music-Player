console.log("Welcome to JavaScript")
let currentsong = new Audio();
let songs;

function secondstominutesseconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingseconds = Math.floor(seconds % 60);
    const formattedminutes = String(minutes).padStart(2, '0');
    const formattedseconds = String(remainingseconds).padStart(2, '0');
    return `${formattedminutes}:${formattedseconds}`;
}

const play = document.getElementById("play");
async function getSongs() {
    let a = await fetch("./songs/");
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("songs%5C")[1])
        }
    }
    return songs
}

const playmusic = (track) => {
    currentsong.src = "/songs/" + track;
    currentsong.play();
    play.src = "Images/pause.png";
    const cleanTitle = decodeURI(track).replace(".mp3", "").trim();
    document.querySelector(".currentsongtitle").textContent = cleanTitle;
    document.querySelector(".songinfo").innerHTML = cleanTitle;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    const cover = document.querySelector(".songdetails img");
    const imagename = cleanTitle;
    cover.src = `Images/${imagename}.jpg`;
    //default if image not found
    cover.onerror = () => {
        cover.src = "Images/playingmusic.jpg";
    }
}

async function main() {
    let repeatmode = 0;
    // 0 = repeat off
    // 1 = repeat full list
    // 2 = repeat one song

    //list of all songs
    songs = await getSongs()

    //shuffle all button in left
    const shuffleAllBtn = document.querySelector(".songlist .info button");
    shuffleAllBtn.addEventListener("click", () => {
        if (!songs || songs.length === 0) return;
        // random song index
        const randomIndex = Math.floor(Math.random() * songs.length);
        // play random song
        playmusic(songs[randomIndex]);
    });

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li> 
                                <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <button>Play Song</button>
                    </div>
            </li>`;
    }

    //Attach an event to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    //plays next after one ends
    currentsong.addEventListener("ended", () => {
        if (repeatmode === 2) {
            playmusic(songs[songs.indexOf(currentsong.src.split("/").pop())]);
            return;
        }
        let index = songs.indexOf(currentsong.src.split("/").pop());
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1]);
        }
        else if (repeatmode === 1) {
            playmusic(songs[0]);
        }
    });

    // Attach an event listener to play, previous, next buttons
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "Images/pause.png";
        }
        else {
            currentsong.pause()
            play.src = "Images/play-button.png";
        }
    })

    //Listen for time update event.
    const seekbar = document.querySelector(".slider2");
    currentsong.addEventListener("timeupdate", () => {
        if (!currentsong.duration) return;
        document.querySelector(".songtime").innerHTML =
            `${secondstominutesseconds(currentsong.currentTime)} / ${secondstominutesseconds(currentsong.duration)}`;
        seekbar.style.setProperty("--progress", `${(currentsong.currentTime / currentsong.duration) * 100}%`);
    });

    seekbar.addEventListener("input", (e) => {
        currentsong.currentTime = (currentsong.duration * e.target.value) / 100;
    });

    // Updates the seekbar smoothly at 60fps
    function smoothSeekbarUpdate() {
        if (currentsong.duration && !seekbar.dragging) {
            seekbar.value = (currentsong.currentTime / currentsong.duration) * 100;
        }
        requestAnimationFrame(smoothSeekbarUpdate);
    }
    requestAnimationFrame(smoothSeekbarUpdate);


    //Add an event listener to previous
    const previous = document.getElementById("previous")
    previous.addEventListener("click", () => {
        currentsong.pause()
        console.log("Previous Clicked")
        console.log(currentsong)
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })

    //Add an event listener to next
    const next = document.getElementById("next")
    next.addEventListener("click", () => {
        currentsong.pause()
        console.log("Next Clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })

    //Adding the shuffle function
    const shufflebtn = document.querySelector(".shuffle");
    let lastshuffleindex = -1;
    shufflebtn.addEventListener("click", () => {
        if (!songs || songs.length === 0) return;
        let randomindex;
        do {
            randomindex = Math.floor(Math.random() * songs.length);
        }
        while (randomindex === lastshuffleindex && songs.length > 1);
        lastshuffleindex = randomindex;
        playmusic(songs[randomindex]);
    })

    //Add an event to volume
    document.querySelector(".slidecontainer").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e, e.target, e.target.value)
        currentsong.volume = parseInt(e.target.value) / 100
    })

    //adds colour to volume part
    const volumeSlider = document.querySelector(".slider");
    volumeSlider.style.setProperty("--value", `${volumeSlider.value}%`);
    volumeSlider.addEventListener("input", (e) => {
        volumeSlider.style.setProperty("--value", `${e.target.value}%`);
    });


    //Add an event to mute the volume
    document.querySelector(".vol").addEventListener("click", e => {
        if (e.target.src.includes("Images/volume.png")) {
            e.target.src = e.target.src.replace("Images/volume.png", "Images/mute.png")
            currentsong.volume = 0;
            document.querySelector(".slidecontainer").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("Images/mute.png", "Images/volume.png")
            currentsong.volume = .10;
            document.querySelector(".slidecontainer").getElementsByTagName("input")[0].value = .10;
        }
    })

    document.querySelectorAll(".cardrow").forEach(cardrow => {
        const cardcontainer = cardrow.querySelector(".cardclass");
        const leftarrow = cardrow.querySelector(".arrow.leftarr");
        const rightarrow = cardrow.querySelector(".arrow.rightarr");

        const scrollamount = 220;

        leftarrow.addEventListener("click", () => {
            cardcontainer.scrollBy({
                left: -scrollamount,
                behavior: "smooth"
            });
        });

        rightarrow.addEventListener("click", () => {
            cardcontainer.scrollBy({
                left: scrollamount,
                behavior: "smooth"
            });
        });

        function updateCardArrows() {
            leftarrow.style.display = cardcontainer.scrollLeft <= 0 ? "none" : "block";
            rightarrow.style.display = cardcontainer.scrollLeft + cardcontainer.clientWidth >= cardcontainer.scrollWidth ? "none" : "block";
        }
        cardcontainer.addEventListener("scroll", updateCardArrows);
        updateCardArrows();
    });

    //Repeat Button Functionality
    const repeatbtn = document.getElementById("repeat");
    repeatbtn.addEventListener("click", () => {
        repeatmode = (repeatmode + 1) % 3;
    })
    if (repeatmode === 0) {
        repeatbtn.style.filter = "invert(1)";
        repeatbtn.style.filter = "background-color: white";
    }
    else if (repeatmode === 1) {
        repeatmode.style.filter = "invert(0.5)";
    }
    else {
        repeatbtn.style.filter = "invert(0)";
    }

    //repeat button change
    const repeattbtn = document.getElementById("repeat");
    repeattbtn.addEventListener("click", () => {
        repeatmode = (repeatmode + 1) % 3;
        if (repeatmode === 0) {
            repeattbtn.src = "Images/repeat.png"
        }
        if (repeatmode === 1) {
            repeattbtn.src = "Images/repeatall.png"
        }
        if (repeatmode === 2) {
            repeattbtn.src = "Images/repeatone.png"
        }
    })

    //search song bar
    const searchinput = document.querySelector(".nav1 input");
    searchinput.addEventListener("input", () => {
        let query = searchinput.value.toLowerCase();
        let songitems = document.querySelectorAll(".songlist li");
        songitems.forEach(item => {
            let songname = item.innerText.toLowerCase();
            if (songname.includes(query)) {
                item.style.display = "block";
            }
            else {
                item.style.display = "none";
            }
        })
    })

    //clickable album cards
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => {
            const albumname = card.querySelector("h3").innerText;
            const artist = card.querySelector("p") ? card.querySelector("p").innerText : "";
            const imgsrc = card.querySelector("img") ? card.querySelector("img").src : "";

            window.location.href = `album.html?album=${encodeURIComponent(albumname)}&artist=${encodeURIComponent(artist)}&img=${encodeURIComponent(imgsrc)}`;
        });
    });

    //show all dialogbox

    const modal = document.querySelector(".showallmodal");
    const modalcards = document.querySelector(".modalcards");
    const modaltitle = document.querySelector(".modaltitle");
    const closemodal = document.querySelector(".closemodal");

    document.querySelectorAll(".rightnav button").forEach((btn, index) => {
        btn.addEventListener("click", () => {
            modal.style.display = "flex";
            // corresponding card section
            const currentRow = document.querySelectorAll(".cardclass")[index];
            // section title
            const currentTitle = document.querySelectorAll(".rightnav h2")[index];
            modaltitle.innerText = currentTitle.innerText;
            // clone cards
            modalcards.innerHTML = currentRow.innerHTML;

            const modalCardItems = modalcards.querySelectorAll(".card");
            modalCardItems.forEach(card => {
                card.addEventListener("click", () => {
                    const albumname = card.querySelector("h3").innerText;
                    const artist = card.querySelector("p") ? card.querySelector("p").innerText : "";
                    const imgsrc = card.querySelector("img") ? card.querySelector("img").src : "";
                    window.location.href = `album.html?album=${encodeURIComponent(albumname)}&artist=${encodeURIComponent(artist)}&img=${encodeURIComponent(imgsrc)}`;
                });
            });
        });
    });

    // close button
    closemodal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // close outside click
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    const maintenancePopup = document.querySelector(".maintenancepopup");
    const closeMaintenance = document.querySelector(".closemaintenance");

    // left buttons
    const createPlaylistBtn = document.querySelector(".bracket1 button");
    const browsePodcastBtn = document.querySelector(".bracket2 button");

    // open popup
    function openMaintenancePopup(title = "Service Under Maintenance", message = "This feature is currently unavailable and is under maintenance. Please try again later.") {
        const maintenanceHeading = document.querySelector(".mainhead");
        const maintenanceText = document.querySelector(".maintext");
        maintenanceHeading.innerText = title;
        maintenanceText.innerText = message;
        maintenancePopup.classList.add("active");
    }

    // close popup
    function closeMaintenancePopup() {
        maintenancePopup.classList.remove("active");
    }

    // button events
    createPlaylistBtn.addEventListener("click", () => {
        openMaintenancePopup();
    });
    browsePodcastBtn.addEventListener("click", () => {
        openMaintenancePopup();
    });

    // close button
    closeMaintenance.addEventListener("click", closeMaintenancePopup);

    // click outside to close
    maintenancePopup.addEventListener("click", (e) => {
        if (e.target === maintenancePopup) {
            closeMaintenancePopup();
        }
    });

    const languageBtn = document.querySelector(".lang button");
    const languagePopup = document.querySelector(".languagepopup");
    const closeLanguage = document.querySelector(".closelanguage");

    // open popup
    languageBtn.addEventListener("click", () => {
        languagePopup.classList.add("active");
    });

    // close button
    closeLanguage.addEventListener("click", () => {
        languagePopup.classList.remove("active");
    });

    // click outside
    languagePopup.addEventListener("click", (e) => {
        if (e.target === languagePopup) {
            languagePopup.classList.remove("active");
        }
    });

    const footPopup = document.querySelector(".footpopup");
    const closeFootPopup = document.querySelector(".closefootpopup");

    // all foot items
    document.querySelectorAll(".foot li")
        .forEach(item => {
            item.addEventListener("click", () => {
                footPopup.classList.add("active");
            });
        });

    // close button
    closeFootPopup.addEventListener("click", () => {
        footPopup.classList.remove("active");
    });

    // click outside
    footPopup.addEventListener("click", (e) => {
        if (e.target === footPopup) {
            footPopup.classList.remove("active");
        }
    });

    const lyricsBtn = document.querySelector(".lyricsbtn");

    lyricsBtn.addEventListener("click", () => {
        openMaintenancePopup("Lyrics Currently Unavailable", "Lyrics support is currently under maintenance and will be available in a future update.");
    });

    const fullscreenBtn = document.querySelector(".fullscreenbtn");
    const fullscreenPopup = document.querySelector(".fullscreenpopup");
    const closeFullscreen = document.querySelector(".closefullscreen");
    const fullscreenCover = document.querySelector(".fullscreencover");
    const fullscreenTitle = document.querySelector(".fullscreentitle");
    const fullscreenArtist = document.querySelector(".fullscreenartist");

    // open
    fullscreenBtn.addEventListener("click", () => {
        fullscreenPopup.classList.add("active");

        // sync details
        fullscreenTitle.innerText = document.querySelector(".currentsongtitle").innerText;
        fullscreenArtist.innerText = "Now Playing";
        fullscreenCover.src = document.querySelector(".songdetails img").src;
    });

    // close
    closeFullscreen.addEventListener("click", () => {
        fullscreenPopup.classList.remove("active");
    });

    // outside click
    fullscreenPopup.addEventListener("click", (e) => {
        if (e.target === fullscreenPopup) {
            fullscreenPopup.classList.remove("active");
        }
    });

    const premiumBtn = document.querySelector(".premiumbtn");
    const premiumPopup = document.querySelector(".premiumpopup");
    const closePremium = document.querySelector(".closepremium");

    // open
    premiumBtn.addEventListener("click", () => {
        premiumPopup.classList.add("active");
    });

    // close
    closePremium.addEventListener("click", () => {
        premiumPopup.classList.remove("active");
    });

    // outside click
    premiumPopup.addEventListener("click", (e) => {
        if (e.target === premiumPopup) {
            premiumPopup.classList.remove("active");
        }
    });

    const premiumJoinBtn = document.querySelector(".premiumjoin");
    const successPopup = document.querySelector(".successpopup");
    const closeSuccess = document.querySelector(".closesuccess");

    // open success popu
    premiumJoinBtn.addEventListener("click", () => {
        // close premium popup
        premiumPopup.classList.remove("active");
        // open success popup
        successPopup.classList.add("active");
    });

    // close success
    closeSuccess.addEventListener("click", () => {
        successPopup.classList.remove("active");
    });

    // outside click
    successPopup.addEventListener("click", (e) => {
        if (e.target === successPopup) {
            successPopup.classList.remove("active");
        }
    });

    const supportBtn = document.querySelector(".supportbtn");
    const supportPopup = document.querySelector(".supportpopup");
    const closeSupport = document.querySelector(".closesupport");

    // OPEN
    supportBtn.addEventListener("click", () => {
        supportPopup.classList.add("active");
    });

    // CLOSE
    closeSupport.addEventListener("click", () => {
        supportPopup.classList.remove("active");
    });

    // OUTSIDE CLICK
    supportPopup.addEventListener("click", (e) => {
        if (e.target === supportPopup) {
            supportPopup.classList.remove("active");
        }
    });

    const contactSupportBtn = document.querySelector(".contactsupport");
    const supportSuccessPopup = document.querySelector(".supportsuccesspopup");
    const closeSupportSuccess = document.querySelector(".closesupportsuccess");

    // OPEN SUCCESS POPUP
    contactSupportBtn.addEventListener("click", () => {
        // close support popup
        supportPopup.classList.remove("active");
        // open success popup
        supportSuccessPopup.classList.add("active");
    });

    // CLOSE SUCCESS
    closeSupportSuccess.addEventListener("click", () => {
        supportSuccessPopup.classList.remove("active");
    });

    // OUTSIDE CLICK
    supportSuccessPopup.addEventListener("click", (e) => {
        if (e.target === supportSuccessPopup) {
            supportSuccessPopup.classList.remove("active");
        }
    });

    const downloadBtn = document.querySelector(".downloadbtn");
    const installBtn = document.querySelector(".installbtn");
    // DOWNLOAD
    downloadBtn.addEventListener("click", () => {
        openMaintenancePopup("Downloads Currently Unavailable", "The download service is currently under maintenance. Please try again later.");
    });
    // INSTALL App
    installBtn.addEventListener("click", () => {
        openMaintenancePopup("App Installation Unavailable", "The Spotify desktop installation service is currently under maintenance and will return soon.");
    });

    const signupBtn = document.querySelector(".signupbtn");
    const loginBtn = document.querySelector(".loginbtn");
    const authPopup = document.querySelector(".authpopup");
    const closeAuth = document.querySelector(".closeauth");
    const authHeading = document.querySelector(".authheading");
    const authSubtitle = document.querySelector(".authsubtitle");
    const authSubmit = document.querySelector(".authsubmit");
    const authSwitch = document.querySelector(".authswitch span");
    const signupFields = document.querySelectorAll(".signupfield");
    const authSuccessPopup = document.querySelector(".authsuccesspopup");
    const closeAuthSuccess = document.querySelector(".closeauthsuccess");
    let isSignupMode = false;

    // LOGIN MODE
    function showLoginMode() {
        isSignupMode = false;
        authHeading.innerText = "Welcome Back";
        authSubtitle.innerText = "Log in to continue listening";
        authSubmit.innerText = "Log In";
        signupFields.forEach(field => {
            field.style.display = "none";
        });
        authSwitch.innerText = "Sign Up";
    }

    // SIGNUP MODE
    function showSignupMode() {
        isSignupMode = true;
        authHeading.innerText = "Create Account";
        authSubtitle.innerText = "Sign up to start listening";
        authSubmit.innerText = "Create Account";
        signupFields.forEach(field => {
            field.style.display = "block";
        });
        authSwitch.innerText = "Log In";
    }

    // OPEN LOGIN
    loginBtn.addEventListener("click", () => {
        showLoginMode();
        authPopup.classList.add("active");
    });

    // OPEN SIGNUP
    signupBtn.addEventListener("click", () => {
        showSignupMode();
        authPopup.classList.add("active");

    });

    // SWITCH MODE
    authSwitch.addEventListener("click", () => {
        if (isSignupMode) {
            showLoginMode();
        }
        else {
            showSignupMode();
        }
    });

    // CLOSE
    closeAuth.addEventListener("click", () => {
        authPopup.classList.remove("active");
    });

    // OUTSIDE CLICK
    authPopup.addEventListener("click", (e) => {
        if (e.target === authPopup) {
            authPopup.classList.remove("active");
        }
    });

    // SUBMIT
    authSubmit.addEventListener("click", () => {
        authPopup.classList.remove("active");
        authSuccessPopup.classList.add("active");
    });

    // CLOSE SUCCESS
    closeAuthSuccess.addEventListener("click", () => {
        authSuccessPopup.classList.remove("active");
    });

    // OUTSIDE SUCCESS
    authSuccessPopup.addEventListener("click", (e) => {
        if (e.target === authSuccessPopup) {
            authSuccessPopup.classList.remove("active");
        }
    });

    const companyColumn = document.querySelector(".companycolumn");
    const columnPopup = document.querySelector(".columnpopup");
    const closeColumnPopup = document.querySelector(".closecolumnpopup");

    // OPEN
    if (companyColumn) {
        companyColumn.addEventListener("click", () => {
            columnPopup.classList.add("active");
        });
    }
    // CLOSE
    if (closeColumnPopup) {
        closeColumnPopup.addEventListener("click", () => {
            columnPopup.classList.remove("active");
        });
    }
    // OUTSIDE CLICK
    if (columnPopup) {
        columnPopup.addEventListener("click", (e) => {
            if (e.target === columnPopup) {
                columnPopup.classList.remove("active");
            }
        });
    }

    const communitiesColumn = document.querySelector(".communitiescolumn");
    const communitiesPopup = document.querySelector(".communitiespopup");
    const closeCommunitiesPopup = document.querySelector(".closecommunitiespopup");

    // OPEN POPUP
    if (communitiesColumn) {
        communitiesColumn.addEventListener("click", () => {
            communitiesPopup.classList.add("active");
        });
    }

    // CLOSE BUTTON
    if (closeCommunitiesPopup) {
        closeCommunitiesPopup.addEventListener("click", () => {
            communitiesPopup.classList.remove("active");
        });
    }

    // OUTSIDE CLICK
    if (communitiesPopup) {
        communitiesPopup.addEventListener("click", (e) => {
            if (e.target === communitiesPopup) {
                communitiesPopup.classList.remove("active");
            }
        });
    }

    const usefulLinksColumn = document.querySelector(".usefullinkscolumn");
    const usefulLinksPopup = document.querySelector(".usefullinkspopup");
    const closeUsefulLinksPopup = document.querySelector(".closeusefullinkspopup");
    // OPEN POPUP
    if (usefulLinksColumn) {
        usefulLinksColumn.addEventListener("click", () => {
            usefulLinksPopup.classList.add("active");
        });
    }

    // CLOSE BUTTON
    if (closeUsefulLinksPopup) {
        closeUsefulLinksPopup.addEventListener("click", () => {
            usefulLinksPopup.classList.remove("active");
        });
    }

    // OUTSIDE CLICK
    if (usefulLinksPopup) {
        usefulLinksPopup.addEventListener("click", (e) => {
            if (e.target === usefulLinksPopup) {
                usefulLinksPopup.classList.remove("active");
            }
        });
    }

    const plansColumn = document.querySelector(".planscolumn");
    const plansPopup = document.querySelector(".planspopup");
    const closePlansPopup = document.querySelector(".closeplanspopup");

    // OPEN
    if (plansColumn) {
        plansColumn.addEventListener("click", () => {
            plansPopup.classList.add("active");
        });
    }

    // CLOSE
    if (closePlansPopup) {
        closePlansPopup.addEventListener("click", () => {
            plansPopup.classList.remove("active");
        });
    }

    // OUTSIDE CLICK
    if (plansPopup) {
        plansPopup.addEventListener("click", (e) => {
            if (e.target === plansPopup) {
                plansPopup.classList.remove("active");
            }
        });
    }

    const socialApps = document.querySelector(".socialapps");
    const socialPopup = document.querySelector(".socialpopup");
    const closeSocialPopup = document.querySelector(".closesocialpopup");

    // OPEN
    if (socialApps) {
        socialApps.addEventListener("click", () => {
            socialPopup.classList.add("active");
        });
    }

    // CLOSE
    if (closeSocialPopup) {
        closeSocialPopup.addEventListener("click", () => {
            socialPopup.classList.remove("active");
        });
    }

    // OUTSIDE CLICK
    if (socialPopup) {
        socialPopup.addEventListener("click", (e) => {
            if (e.target === socialPopup) {
                socialPopup.classList.remove("active");
            }
        });
    }

    const footerSignupBtn = document.querySelector(".footersignupbtn");
if(footerSignupBtn){
    footerSignupBtn.addEventListener("click", ()=>{
        // OPEN EXISTING AUTH POPUP
        authPopup.classList.add("active");
        // SWITCH TO SIGNUP MODE
        isSignupMode = true;
        authHeading.innerText = "Create Account";
        authSubtitle.innerText = "Sign up to start listening";
        authSubmit.innerText = "Sign Up";

        signupFields.forEach(field => {
            field.style.display = "block";
        });
        authSwitch.innerHTML =`<span>Log In</span>`;
    });

}

}
main()