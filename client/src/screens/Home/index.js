import { useEffect, useRef, useState } from 'react'
import Author from 'components/Author'
import Socket from 'socket.io-client';
import { EyeOutlined, PlusOutlined, CaretRightOutlined } from '@ant-design/icons';
import {
    Col,
    Row,
    Button,
    Form,
    Input,
    Layout,
    Drawer,
    Card,
    Tabs
} from 'antd';
import { Chessboard } from "react-chessboard";
import ConnectError from 'components/ConnectError'
const { Header, Footer, Content } = Layout;
const { Meta } = Card;
const { TabPane } = Tabs;

const socket = Socket(process.env.REACT_APP_SOCKET_URL, { // const socket = Socket('https://multi-chess.onrender.com/', {
    transports: ['websocket', 'polling', 'flashsocket']
})

function Home() {

    var temporaryGamePosition = [];

    const messageInput = useRef(null)

    const [allUsers, setAllUsers] = useState([]);
    const [allMessages, setAllMessages] = useState([]);
    const [allRooms, setAllRooms] = useState([]);

    const [myRoom, setMyRoom] = useState(null);
    const [myName, setMyName] = useState(localStorage.getItem("myName") || null);
    const [serverID, setServerID] = useState(null);
    const [isLogin, setIsLogin] = useState(false);
    const [isConnectionLoading, setIsConnectionLoading] = useState(true);

    const [currentRoomPosition, setCurrentRoomPosition] = useState([]);
    const [currentRoomData, setCurrentRoomData] = useState([]);
    const [boardOrient, setBoardOrient] = useState('white');
    const [boardDisabled, setBoardDisabled] = useState('none');

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);



    socket.on("connect_error", () => {
        setIsConnectionLoading(true)
    });

    useEffect(() => { // birini link ile oyuna davet ettiğmizde çalışacak kod örn : http://localhost:3000/?room=room_1
        if (!myRoom) {
            if (window.location.search.split('=')[0].includes('room') && allRooms.filter(e => e.id == window.location.search.split('=')[1]).length == 1) {
                console.log("odaaaa Ç: ", window.location.search.split('=')[1])
                setMyRoom(window.location.search.split('=')[1])
                joinRoom('gamers', window.location.search.split('=')[1])
            } else {
                setMyRoom(null)
            }
        }
    }, [isLogin])

    useEffect(() => {
        if (myRoom) {
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
            setIsConnectionLoading(false)
            setServerID(datas)
            localStorage.setItem("serverID", datas)
        })
    }, [])

    useEffect(() => {
        console.log("güncellenlenmiş oyun pozisyonu : ", currentRoomData.gamePosition)
             //setCurrentRoomPosition(currentRoomData.gamePosition)
    }, [myRoom])


    useEffect(() => {
        setCurrentRoomPosition([])
        setBoardDisabled('none')
        if (currentRoomData.gamePosition) {
            console.log("burası çokomelli :", currentRoomData.gamePosition)
            setCurrentRoomPosition(currentRoomData.gamePosition)
        }

        if (currentRoomData.gamers?.length > 0) {
            setBoardOrient('black')
            if (currentRoomData.gamers[0].user_id == serverID) {
                setBoardOrient('white')
            }
        }

        // console.log("currentRoomData.gameTurn : ", currentRoomData.gameTurn)

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
        var newRoomID = `${new Date().valueOf()
            }-${Math.floor(Math.random() * 1001) + 100
            }`;
        socket.emit('create_room', { roomID: newRoomID })
        joinRoom('gamers', newRoomID)
    }

    const joinRoom = (type, roomID) => {
        socket.emit('join_room', {
            user_type: type,
            room_id: roomID
        })
        socket.emit('set_game_turn', { room_id: myRoom })

        setMyRoom(roomID)
    }

    const leftRoom = () => {
        socket.emit('left_room', { room_id: myRoom })
        setMyRoom(null)
        setCurrentRoomData([])
        window.history.pushState("", "", "/" + "");
    }

    const timeFormatter = (e) => {
        var timeResult = '';
        if (e) {
            timeResult = `${new Date(e).getHours()
                }:`
            if (new Date(e).getHours() < 10) {
                timeResult = `0${new Date(e).getHours()
                    }:`
            }
            if (new Date(e).getMinutes() < 10) {
                timeResult += `0${new Date(e).getMinutes()
                    }`
            } else {
                timeResult += `${new Date(e).getMinutes()
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


    const showDrawer = () => {
        setIsDrawerOpen(true);
    };
    const closeMessageDrawer = () => {
        setIsDrawerOpen(false);
    };


    useEffect(() => {
       console.log("odaya girildi : ", myRoom)
       console.log("odaya girildi currentRoomPosition : ", currentRoomPosition)
    //    setCurrentRoomPosition({ "a1": "bP",
    //    "a2": "wP",
    //    "b1": "wP",
    //    "b2": "wP",})
    }, [myRoom])

    return (
        <div className="App">

            {
                !isConnectionLoading ? (
                    <>{
                        isLogin ? (
                            <> {
                                !myRoom ? (
                                    <>
                                        <Author />
                                        <Layout>
                                            <Header>Header</Header>
                                            <Content>


                                                <Row style={{ margin: '32px auto' }}>

                                                    <Col xs={24}
                                                        sm={12}
                                                        md={8}
                                                        lg={6} >
                                                        <Card style={{ width: '80%', margin: '8px auto' }} actions={
                                                            [

                                                                <Button icon={<PlusOutlined/>} onClick={createRoom}>Oluştur
                                                                </Button>
                                                            ]
                                                        }>
                                                            <Meta

                                                                title="Yeni Oda"
                                                                description="Oda oluştur ve arkadaşını davet et!"
                                                            />
                                                        </Card>
                                                    </Col>


                                                    {
                                                        allRooms?.length > 0 && allRooms.map((e, index) => (

                                                            <Col xs={24}
                                                                sm={12}
                                                                md={8}
                                                                lg={6} key={index}>


                                                                <Card style={
                                                                    { width: '80%', margin: '8px auto' }
                                                                }

                                                                    actions={
                                                                        [
                                                                            <Button icon={<CaretRightOutlined/>} onClick={
                                                                                () => joinRoom('gamers', e.id)
                                                                            }
                                                                                disabled={
                                                                                    e.gamers.length >= 2
                                                                                }>Oyna
                                                                            </Button>,
                                                                            <Button icon={<EyeOutlined/>} onClick={
                                                                                () => joinRoom('viewers', e.id)
                                                                            }>İzle
                                                                            </Button>
                                                                        ]
                                                                    }>
                                                                    <Meta title={`#${index + 1
                                                                        }. Oda`} description={
                                                                            e.viewers.length > 0 && <>{
                                                                                e.viewers.length
                                                                            }
                                                                                İzleyici</>
                                                                        } />
                                                                </Card>


                                                            </Col>
                                                        ))
                                                    }

                                                </Row>

                                            </Content>
                                            <Footer>Footer</Footer>
                                        </Layout>

                                    </>
                                ) : (
                                    <>
                                        <Author />


                                        <Layout>
                                            <Header>
                                                <Button danger onClick={
                                                    () => leftRoom()
                                                }>Odadan Çık</Button>
                                                <Button onClick={showDrawer}>Mesajlar</Button>
                                                <Button >Davet Et</Button>
                                            </Header>
                                            <Content>

                                                <div style={
                                                    {
                                                        width: 'clamp(300px, 60%, 600px)',
                                                        pointerEvents: boardDisabled,
                                                        margin: '32px auto'
                                                    }
                                                }>


                                                    <Chessboard id="BasicBoard"
                                                        arePremovesAllowed={true}

                                                        boardOrientation={boardOrient}
                                                        position={currentRoomPosition}
                                                        getPositionObject={
                                                            e => temporaryGamePosition = e
                                                        }


                                                        onPieceDragEnd={
                                                            () => updateGamePosition(temporaryGamePosition)
                                                        } />

                                                </div>
                                            </Content>
                                            <Footer>Footer</Footer>
                                        </Layout>

                                        <Drawer title="Oda Mesajları" placement="right" onClose={closeMessageDrawer} open={isDrawerOpen}>


                                            <Tabs>
                                                <TabPane tab="Mesajlar" key="tab-a">

                                                    <div>
                                                        <input ref={messageInput} />
                                                        <button onClick={sendMessage}>Gönder</button>
                                                    </div>
                                                    <ul> {
                                                        allMessages?.length > 0 && allUsers?.length > 0 && allMessages.slice(0).reverse().filter(e => e.room_id == myRoom).map((e, index) => (
                                                            <li key={index}>
                                                                {
                                                                    allUsers.find(({ id }) => id == e.user_id).name
                                                                }
                                                                - {

                                                                    e.messageContent
                                                                }
                                                                - {
                                                                    timeFormatter(e.createdAt)
                                                                }</li>
                                                        ))
                                                    } </ul>

                                                </TabPane>
                                                <TabPane tab="İzleyiciler" key="tab-b">
                                                    {
                                                        allUsers?.length > 0 && allRooms.filter((e => e.id == myRoom)).map(e => {
                                                            return e.viewers.length
                                                        }) > 0 && <div>

                                                            <ul> {
                                                                allRooms.filter((e => e.id == myRoom)).map(e => (e.viewers.map((x, index) => (
                                                                    <li key={index}>
                                                                        {
                                                                            allUsers.find(({ id }) => id == x.user_id).name
                                                                        }</li>
                                                                ))))
                                                            } </ul>
                                                        </div>
                                                    }
                                                </TabPane>
                                            </Tabs>


                                        </Drawer>

                                    </>

                                )
                            } </>
                        ) : (
                            <>

                                <Author />
                                <Row className='login'>
                                    <Col xs={
                                        { span: 24 }
                                    }
                                        lg={
                                            { span: 12 }
                                        }>
                                        <Form name="basic" className='login-form' autoComplete="off">
                                            <Form.Item name="username"
                                                rules={
                                                    [{
                                                        required: true,
                                                        message: 'Lütfen kullanıcı adını girin!'
                                                    },]
                                                }>
                                                <Input defaultValue={myName}
                                                    placeholder="Kullanıcı Adı"
                                                    onChange={
                                                        e => setMyName(e.target.value)
                                                    } />
                                            </Form.Item>


                                            <Form.Item style={{marginBottom: 0}}>
                                                <Button type="primary" htmlType="button"
                                                    onClick={createUser}
                                                    disabled={
                                                        !myName
                                                    }>
                                                    Kaydet
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </Col>
                                    <Col xs={
                                        { span: 24 }
                                    }
                                        lg={
                                            { span: 12 }
                                        }>
                                        <div className='login-bg'></div>
                                    </Col>
                                </Row>


                            </>
                        )
                    }</>
                ) : <><Author /><ConnectError /></>
            } </div>
    );
}

export default Home;
