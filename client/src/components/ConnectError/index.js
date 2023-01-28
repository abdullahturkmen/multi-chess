import {useEffect, useState} from 'react'
import Socket from 'socket.io-client';

const socket = Socket(process.env.REACT_APP_SOCKET_URL, { // const socket = Socket('https://multi-chess.onrender.com/', {
    transports: ['websocket', 'polling', 'flashsocket']
})

function ConnectError() {

    var isConnectionLoading=true;

    socket.on("connect_error", () => {
        isConnectionLoading=true;
      });


      if(isConnectionLoading){
        setInterval(() => {
            //console.log("wefsadfg")
            //window.location.href = process.env.REACT_APP_PROJECT_URL;
        }, 10000);
      }


      useEffect(() => {
        socket.on('socket_id', (datas) => {
            isConnectionLoading=false;
            
        })
    }, [])


  

    return (

        <div className="ConnectError">
            <>
                <div className="connect-error">
                    <div className="connect-error-circle"></div>
                    <span>Oyun Başlatılıyor...</span>
                </div>
            </>
        </div>
    );
}

export default ConnectError;
