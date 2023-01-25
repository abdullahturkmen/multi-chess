import {useEffect, useRef, useState} from 'react'
import Socket from 'socket.io-client';
import {Col, message, Row} from 'antd';
import {Chessboard} from "react-chessboard";

const socket = Socket(process.env.REACT_APP_SOCKET_URL, { // const socket = Socket('https://multi-chess.onrender.com/', {
    transports: ['websocket', 'polling', 'flashsocket']
})

function App() {

    var temporaryGamePosition = [];

    const messageInput = useRef(null)

    const [allUsers, setAllUsers] = useState([]);
    const [allMessages, setAllMessages] = useState([]);
    const [allRooms, setAllRooms] = useState([]);

    const [myRoom, setMyRoom] = useState(null);
    const [myName, setMyName] = useState(localStorage.getItem("myName") || null);
    const [serverID, setServerID] = useState(null);
    const [isLogin, setIsLogin] = useState(false);

    const [currentRoomPosition, setCurrentRoomPosition] = useState([]);
    const [currentRoomData, setCurrentRoomData] = useState([]);
    const [boardOrient, setBoardOrient] = useState('white');
    const [boardDisabled, setBoardDisabled] = useState('none');


    useEffect(() => { // birini link ile oyuna davet ettiğmizde çalışacak kod örn : http://localhost:3000/?room=room_1
        if (!myRoom) {
            if (window.location.search.split('=')[0].includes('room') && allRooms.filter(e => e.id == window.location.search.split('=')[1]).length == 1) {

                setMyRoom(window.location.search.split('=')[1])
                joinRoom('gamers', window.location.search.split('=')[1])
            } else {
                setMyRoom(null)
            }


        } else {
            console.log("myRoom : ", myRoom)
            console.log("allRooms : ", allRooms)

            allRooms.filter((x => x.id == myRoom)).map(x => { // return console.log("sdfgdsfg : ",x.gamePosition)
                return setCurrentRoomData(x)
                // return setCurrentRoomPosition(x.gamePosition)
            })
        }

    }, [allRooms])

    useEffect(() => {

        socket.on('all_users', (datas) => { // console.log("gelen userlar : ", datas)
            setAllUsers(datas)
        })
    }, [])

    useEffect(() => {
        socket.on('all_messages', (datas) => { // console.log("gelen mesajlar : ", datas)
            setAllMessages(datas)
        })
    }, [])

    useEffect(() => {
        socket.on('all_rooms', (datas) => { // console.log("gelen odalar : ", datas)
            setAllRooms(datas)

        })
    }, [])


    useEffect(() => {
        socket.on('socket_id', (datas) => {
            setServerID(datas)
            localStorage.setItem("serverID", datas)
        })
    }, [])


    useEffect(() => {
        console.log("odanın tüm detayı : ", currentRoomData)
        setCurrentRoomPosition([])
        setBoardDisabled('none')
        if (currentRoomData.gamePosition) {
            setCurrentRoomPosition(currentRoomData.gamePosition)
        }

        if (currentRoomData.gamers ?. length > 0) {
            setBoardOrient('black')
            if (currentRoomData.gamers[0].user_id == serverID) {
                setBoardOrient('white')
            }
        }

        //console.log("currentRoomData.gameTurn : ", currentRoomData.gameTurn)

        if (currentRoomData.gameTurn == serverID) {
            setBoardDisabled('all')
        }


    }, [currentRoomData])

    const sendMessage = () => {
        socket.emit('send_message', {
            room_id: myRoom,
            user_id: serverID,
            messageContent: messageInput.current.value,
            createdAt: new Date()
        })
        messageInput.current.value = ''
    }
    const createRoom = () => {
        var newRoomID = `${
            new Date().valueOf()
        }-${
            Math.floor(Math.random() * 1001) + 100
        }`;
        socket.emit('create_room', {roomID: newRoomID})
        joinRoom('gamers', newRoomID)
    }

    const joinRoom = (type, roomID) => {
        socket.emit('join_room', {
            user_type: type,
            room_id: roomID
        })
        socket.emit('set_game_turn', {room_id: myRoom})

        setMyRoom(roomID)
    }

    const leftRoom = () => {
        socket.emit('left_room', {room_id: myRoom})
        setMyRoom(null)
        setCurrentRoomData([])
        window.history.pushState("", "", "/" + "");
    }

    const timeFormatter = (e) => {
        var timeResult = '';
        if (e) {
            timeResult = `${
                new Date(e).getHours()
            }:`
            if (new Date(e).getHours() < 10) {
                timeResult = `0${
                    new Date(e).getHours()
                }:`
            }
            if (new Date(e).getMinutes() < 10) {
                timeResult += `0${
                    new Date(e).getMinutes()
                }`
            } else {
                timeResult += `${
                    new Date(e).getMinutes()
                }`
            }
        }
        return timeResult
    }

    const createUser = () => {
        if (myName.trim().length > 0) { // setMyName(myName.trim())
            localStorage.setItem("myName", myName)
            socket.emit('create_user', myName)
            setIsLogin(true)
        }
    }

    const updateGamePosition = (e) => {

        setCurrentRoomPosition(e)
        socket.emit('update_game', {
            new_positions: e,
            room_id: myRoom
        })

    }

    return (
        <div className="App">

            {
            isLogin ? (
                <> {
                    !myRoom ? (
                        <>
                            <button onClick={createRoom}>Yeni Oda</button>
                            <h3>odalar</h3>

                            <ul> {
                                allRooms ?. length > 0 && allRooms.map((e, index) => (
                                    <li key={index}>
                                        <span>{
                                            index + 1
                                        }. Oda</span>
                                        <button onClick={
                                                () => joinRoom('gamers', e.id)
                                            }
                                            disabled={
                                                e.gamers.length >= 2
                                        }>Oyna</button>
                                        <button onClick={
                                            () => joinRoom('viewers', e.id)
                                        }>İzle</button>
                                        {
                                        e.viewers.length > 0 && <>{
                                            e.viewers.length
                                        }
                                            izleyici</>
                                    }</li>
                                ))
                            } </ul>

                        </>
                    ) : (
                        <>
                            <button onClick={
                                () => leftRoom()
                            }>Odadan Çık</button>


                            <div style={
                                {
                                    width: 400,
                                    pointerEvents: boardDisabled
                                }
                            }>


                                <Chessboard id="BasicBoard" arePremovesAllowed={true}

                                    boardOrientation={boardOrient}
                                    position={currentRoomPosition}
                                    getPositionObject={
                                        e => temporaryGamePosition = e
                                    }

                                    

                                    onPieceDragEnd={
                                        () => updateGamePosition(temporaryGamePosition)
                                    }/>

                            </div>


                            <div>Mesaj :
                                <input ref={messageInput}/>
                                <button onClick={sendMessage}>Mesaj Gönder</button>
                            </div>


                            <h3>mesajlar</h3>

                            <ul> {
                                allMessages ?. length > 0 && allUsers ?. length > 0 && allMessages.filter(e => e.room_id == myRoom).map((e, index) => (
                                    <li key={index}>
                                        {
                                        allUsers.find(({id}) => id == e.user_id).name
                                    }
                                        - {

                                        e.messageContent
                                    }
                                        - {
                                        timeFormatter(e.createdAt)
                                    }</li>
                                ))
                            } </ul>

                            {
                            allRooms.filter((e => e.id == myRoom)).map(e => {
                                return e.gamers.length
                            }) > 0 && <div>
                                <span>Oyuncu(lar)</span>
                                <ul> {
                                    allRooms.filter((e => e.id == myRoom)).map(e => (e.gamers.map((x, index) => (
                                        <li key={index}>
                                            {
                                            index + 1
                                        }. {
                                            allUsers.find(({id}) => id == x.user_id).name
                                        }</li>
                                    ))))
                                } </ul>
                            </div>
                        }

                            {
                            allUsers ?. length > 0 && allRooms.filter((e => e.id == myRoom)).map(e => {
                                return e.viewers.length
                            }) > 0 && <div>
                                <span>İzleyiciler ({
                                    allRooms.filter((e => e.id == myRoom)).map(e => {
                                        return e.viewers.length
                                    })
                                })</span>
                                <ul> {
                                    allRooms.filter((e => e.id == myRoom)).map(e => (e.viewers.map((x, index) => (
                                        <li key={index}>
                                            {
                                            allUsers.find(({id}) => id == x.user_id).name
                                        }</li>
                                    ))))
                                } </ul>
                            </div>
                        } </>

                    )
                } </>
            ) : (
                <>
                    <div>Kullanıcı Adın :
                        <input value={myName}
                            onChange={
                                e => setMyName(e.target.value)
                            }/>
                        <button onClick={createUser}
                            disabled={
                                !myName
                        }>Devam Et</button>
                    </div>
                </>
            )
        } </div>
    );
}

export default App;
