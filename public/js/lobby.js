const socket = io.connect();
fetch('/sessions').then(res => {
    if (res.ok) {
        res.json().then(res => {
        console.log(res)
        const chatRoom = res.user.id + "chat"
        const notiRoom = res.user.id + "noti"
        socket.emit('join chat room', chatRoom)
        socket.emit('join notification room', notiRoom)
        console.log(chatRoom,notiRoom);
    })
    } else {
        // Show that there was an error and that the friend request wasn't sent
        throw (err)
    }
});
let selectedMatchID;
const invLi = document.getElementsByClassName('inv-li');
console.log(invLi);
for (let i = 0; i < invLi.length; i++) {
    invLi[i].addEventListener('click', (event) => {
        console.log('yes i did good');
        event.preventDefault();
        clearSelectedMatches();
        selectedMatchID = event.target.getAttribute('data-ID');
        event.target.setAttribute('data-Sel','yes');
    });
}
const clearSelectedMatches = () => {
    for (let i = 0; i < invLi.length; i++) {
        invLi[i].setAttribute('data-Sel','no');
    }
}

const invMatchBtn = document.getElementById('invite-your-match-btn');
// somehow figure out how to get the id of the friend you are inviting
invMatchBtn.addEventListener('click', (event) => {
    event.preventDefault();
    console.log('something happened');
    const matchID = selectedMatchID;
    fetch('/sessions').then(res => {
        if(res.ok) {
            res.json().then(res => {
                console.log(res)
                const socketObj = {
                    matchID,
                    id: res.user.id
                }
                socket.emit('send chat invite', socketObj);
            })
        } else {
            throw err;
        }
    })
});

const backFromLobbyBtn = document.getElementById('back-btn');
backFromLobbyBtn.addEventListener('click', (event) => {
    event.preventDefault();
    fetch('/profile').then(res => {
        if(res.ok) {
            document.location.replace('/profile');
        } else {
            throw (err);
        }
    })
});


const opponent = document.getElementById('users2');
socket.on('match joining lobby', (id) => {
    fetch('api/users/'+id).then(userData => {
        userData.json().then(userData => {
        opponent.textContent = userData.UserData.username;
    })})
    backFromLobbyBtn.addEventListener('click',(event) => {
        socket.emit('host pressed back button',id)
    })
    const startChatBtn = document.getElementById('start-btn');
    startChatBtn.addEventListener('click', (event) => {
        event.preventDefault();
        fetch('/sessions').then(res => {
            if (res.ok) {
                res.json().then(res => {
                    const socketObj = {
                        userID: res.user.id,
                        opponentID: id
                    }
                    socket.emit('starting chat',socketObj);
                    document.location.replace('/chatroom');
                })
            } else {
            //Show that there was an error and that the friend request wasn't sent
            throw (err)
            }
        });
    });
});