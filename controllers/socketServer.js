const { User } = require("../models");

// sockets to listen to connection
exports = module.exports = function (io) {
    io.on('connection', function (socket) {
        io.emit('greeting', 'welcome to dog date site!');

        socket.on('host pressed back button', hostPressBackBtn)
        socket.on("join notification room", joinNotiRoom)
        socket.on("send match request", sendMatchReq)
        socket.on("match request accepted", matchReqAcc)
        socket.on('send chat invite', sendChatInv)
        socket.on('chat invite accepted', chatInvAcc)
        socket.on('moving to chatroom', moveToChat)
        socket.on("join chat room", joinChatRoom)
        socket.on('starting chat', startChat)
        // socket.on('message submitted', messageSubmitted)
        

        function matchReqAcc(socketObj) {
            const userId = socketObj.userId
            const matchId = socketObj.matchID
            User.findOne({
                where: { id: userId }
            }).then(userData => {
                const matchesList = userData.matches_list;
                const matchesListArr = matchesList.split(' ');
                matchesListArr.push(matchId + "," + socketObj.matchUsername);
                User.update({matches_list: matchesListArr.join(' ')},{
                    where: { id: userId }
                })
            })
            User.findOne({
                where: { id: matchId }
            }).then(userData => {
                const matchesList = userData.matches_list;
                const matchesListArr = matchesList.split(' ');
                matchesListArr.push(userId + "," + socketObj.userUsername);
                User.update({matches_list: matchesListArr.join(' ')},{
                    where: { id: matchId }
                })
            })
        }

        function joinChatRoom(chatRoom) {
            socket.broadcast.to(chatRoom).emit("sendMessage", "SERVER : a user just joined");
            if (chatRoom) {
                socket.join(chatRoom);
                //users.filter(foundUser => foundUser.id == socket.id)[0].chatRoom = chatRoom;
            }
        }

        function joinNotiRoom(notiRoom) {
            socket.broadcast.to(notiRoom).emit("sendMessage", "SERVER : a user just joined");
            if (notiRoom) {
                socket.join(notiRoom);
                //users.filter(foundUser => foundUser.id == socket.id)[0].notiRoom = notiRoom;
            }
        }
        function sendMatchReq(socketObj) {
            const newMatchEmail = socketObj.email
            User.findOne({
                where: { email: newMatchEmail }
            }).then(res => {
                const matchID = res.id
                socket.broadcast.to(matchID + "noti").emit("match request sent", socketObj.id)
            })
        }
        function sendChatInv(socketObj) {
            const matchID = socketObj.matchID;
            socket.broadcast.to(matchID + "noti").emit("chat invite sent", socketObj.id);
        }
        function chatInvAcc(socketObj) {
            const matchID = socketObj.matchID;
            const userID = socketObj.userId;
            socket.broadcast.to(matchID + 'chat').emit('match joining lobby',userID);
            const stopper = 0;
            const interval = setInterval(() => {
                socket.broadcast.to(userID + 'chat').emit('I am joining lobby',matchID);
                if(stopper==0){
                    clearInterval(interval);
                }
            },1000)
        }
        function startChat(socketObj) {
            const opponentID = socketObj.opponentID;
            socket.broadcast.to(opponentID + 'chat').emit('start the chat',socketObj);
        }
        function moveToChat(socketObj) {
            const hostID = socketObj.userID;
            const opponentID = socketObj.opponentID;
            const stopper = 0;
            const interval = setInterval(() => {
                socket.broadcast.to(hostID + 'chat').emit('the chat is starting',socketObj);
                socket.broadcast.to(opponentID + 'chat').emit('the chat is starting',socketObj);
                if(stopper==0){
                    clearInterval(interval);
                }
            },5000)
        }
        // function messageSubmitted(socketObj) {
        //     const hostID = socketObj.hostID;
        //     const opponentID = socketObj.opponentID;
        //     let wKingLeft = false;
        //     let bKingLeft = false;
        //     for (let i = 0; i < 8; i++) {
        //         for (let j = 0; j < 8; j++) {
        //             if(socketObj.gameboard[i][j].piece==='w-King'){
        //                 wKingLeft = true;
        //             }
        //             if(socketObj.gameboard[i][j].piece==='b-King'){
        //                 bKingLeft = true;
        //             }
        //         }                
        //     }
        //     if(wKingLeft && bKingLeft){
        //         if(socketObj.user === 'w'){
        //             socket.broadcast.to(opponentID + 'game').emit('opponent moved',socketObj);
        //         } else {
        //             socket.broadcast.to(hostID + 'game').emit('opponent moved',socketObj);
        //         }
        //     } else if (wKingLeft) {
        //         console.log('white has won the game!');
        //         socketObj.winner = 'b';
        //         io.sockets.in(opponentID + 'game').emit('game over',socketObj);
        //         io.sockets.in(hostID + 'game').emit('game over',socketObj);
        //     } else {
        //         console.log('black has won the game!');
        //         socketObj.winner = 'b';
        //         io.sockets.in(opponentID + 'game').emit('game over',socketObj);
        //         io.sockets.in(hostID + 'game').emit('game over',socketObj);
        //     }
        // }
        function hostPressBackBtn(id) {
            socket.broadcast.to(id+'chat').emit('host left');
        }
    })
}