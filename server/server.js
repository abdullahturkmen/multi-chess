var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var PORT = process.env.PORT || 3001;

var gameDefaultPositions = {
    "a8": "bR",
    "b8": "bN",
    "c8": "bB",
    "d8": "bQ",
    "e8": "bK",
    "f8": "bB",
    "g8": "bN",
    "h8": "bR",
    "a7": "bP",
    "b7": "bP",
    "c7": "bP",
    "d7": "bP",
    "e7": "bP",
    "f7": "bP",
    "g7": "bP",
    "h7": "bP",
    "a2": "wP",
    "b2": "wP",
    "c2": "wP",
    "d2": "wP",
    "e2": "wP",
    "f2": "wP",
    "g2": "wP",
    "h2": "wP",
    "a1": "wR",
    "b1": "wN",
    "c1": "wB",
    "d1": "wQ",
    "e1": "wK",
    "f1": "wB",
    "g1": "wN",
    "h1": "wR"
}

var usersList = [
    {
        id: '1gfdsdfgsdfgsdfgxcvzxv',
        name: "abdullah"
    },
    {
        id: '2x12d1c313',
        name: "meryem"
    },
    {
        id: 3,
        name: "ahmet"
    },
    {
        id: 4,
        name: "mehmet"
    }, {
        id: 5,
        name: "ömer"
    }, {
        id: 6,
        name: "miço"
    }, {
        id: 7,
        name: "maho"
    }, {
        id: '8dfsdfwr3433423',
        name: "ekrem abi"
    }
]

var messagesList = [
    {
        room_id: 'room_1',
        user_id: '2x12d1c313',
        messageContent: 'selam'
    }, {
        room_id: 'room_1',
        user_id: '1gfdsdfgsdfgsdfgxcvzxv',
        messageContent: 'hoşgeldin'
    }, {
        room_id: 'room_2',
        user_id: '8dfsdfwr3433423',
        messageContent: 'iyi eğlenceler'
    }

];
var roomsList = [
    {
        id: 'room_1',
        gamers: [
            {
                user_id: '1gfdsdfgsdfgsdfgxcvzxv'
            }, {
                user_id: '2x12d1c313'
            }
        ],
        viewers: [
            {
                user_id: 3
            }, {
                user_id: 4
            }, {
                user_id: 5
            }
        ],
        prevGamePosition: {
            "c8": "bB",
            "a8": "bQ",
            "a2": "bK"
        },
        gamePosition: {
            "c8": "bB",
            "d8": "bQ",
            "e8": "bK"
        },
        gameTurn: '2x12d1c313'
    }, {
        id: 'room_2',
        gamers: [
            {
                user_id: '8dfsdfwr3433423'
            }
        ],
        viewers: [],
        prevGamePosition: {},
        gamePosition: {
            "a8": "bR",
            "b8": "bN",
            "c8": "bB",
            "d8": "bQ",
            "e8": "bK",
            "f8": "bB",
            "g8": "bN",
            "a7": "bP",
            "b7": "bP",
            "c7": "bP",
            "d7": "bP",
            "f7": "bP",
            "g7": "bP",
            "h7": "bP",
            "a2": "wP",
            "b2": "wP",
            "c2": "wP",
            "h2": "wP",
            "b1": "wN",
            "c1": "wB",
            "d1": "wQ",
            "e1": "wK",
            "f1": "wB",
            "g1": "wN",
            "h1": "wR",
            "d5": "bP",
            "e4": "wP",
            "c4": "wR",
            "f5": "bR"
        },
        gameTurn: '8dfsdfwr3433423'
    }
];

app.get('/', function (req, res) {
    res.send()
})

io.on("connection", function (socket) {

    socket.emit('socket_id', socket.id)

    io.emit('all_users', usersList)
    io.emit('all_messages', messagesList)
    io.emit('all_rooms', roomsList)


    socket.on('create_user', (e) => {
        if (e.length > 0) {
            usersList.push({id: socket.id, name: e})
        }

        io.emit('all_users', usersList)
    })


    socket.on('send_message', (e) => {
        messagesList.push(e)
        io.emit('all_messages', messagesList)
    })


    socket.on('create_room', (e) => {
        roomsList.push({
            id: e.roomID,
            gamers: [],
            viewers: [],
            prevGamePosition: {},
            gamePosition: gameDefaultPositions,
            gameTurn: socket.id
        })
        io.emit('all_rooms', roomsList)
    })

    socket.on('join_room', (e) => {
        var updateRoomIndex = roomsList.findIndex(obj => obj.id == e.room_id)
        roomsList[updateRoomIndex][e.user_type].push({'user_id': socket.id})
        io.emit('all_rooms', roomsList)
    })

    socket.on('left_room', (e) => {
        var roomIndex = roomsList.findIndex(obj => obj.id == e.room_id)
        var userID = socket.id
        var roomGamersIndex = roomsList[roomIndex]['gamers'].findIndex(obj => obj.user_id == userID)
        if (roomGamersIndex >= 0) {
            roomsList[roomIndex]['gamers'].splice(roomGamersIndex, 1)
        }
        var roomViewersIndex = roomsList[roomIndex]['viewers'].findIndex(obj => obj.user_id == userID)
        if (roomViewersIndex >= 0) {
            roomsList[roomIndex]['viewers'].splice(roomViewersIndex, 1)
        }
        if (roomsList[roomIndex]['gamers'].length == 0) { // TODO: odada bulunan izleyicilerin ekranına mesaj düşür
            roomsList.splice(roomIndex, 1)
        }
        io.emit('all_rooms', roomsList)
    })

    socket.on("disconnect", () => {

        roomsList.map((e, index) => {

            var roomIndex = index
            var userID = socket.id

            var roomGamersIndex = roomsList[roomIndex]['gamers'].findIndex(obj => obj.user_id == userID)
            if (roomGamersIndex >= 0) {
                roomsList[roomIndex]['gamers'].splice(roomGamersIndex, 1)

            }
            var roomViewersIndex = roomsList[roomIndex]['viewers'].findIndex(obj => obj.user_id == userID)
            if (roomViewersIndex >= 0) {
                roomsList[roomIndex]['viewers'].splice(roomViewersIndex, 1)
            }
            if (roomsList[roomIndex]['gamers'].length == 0) { // TODO: odada bulunan izleyicilerin ekranına mesaj düşür
                roomsList.splice(roomIndex, 1)
            }

            io.emit('all_rooms', roomsList)
        })
    });


    socket.on('update_game', (e) => {

        var roomIndex = roomsList.findIndex(obj => obj.id == e.room_id)

        if (JSON.stringify(roomsList[roomIndex]['prevGamePosition']) !== JSON.stringify(e.new_positions)) {

            if (roomsList[roomIndex]['gamers'].length == 2) {
                if (roomsList[roomIndex]['gameTurn'] == roomsList[roomIndex]['gamers'][0].user_id) {
                    roomsList[roomIndex]['gameTurn'] = roomsList[roomIndex]['gamers'][1].user_id
                } else {
                    roomsList[roomIndex]['gameTurn'] = roomsList[roomIndex]['gamers'][0].user_id
                }

                
                roomsList[roomIndex]['prevGamePosition'] = roomsList[roomIndex]['gamePosition']
                roomsList[roomIndex]['gamePosition'] = e.new_positions
                io.emit('all_rooms', roomsList)

            }


        }


    })

});


http.listen(PORT, function () {
    console.log("server is runnnngggg : ", PORT)
})
