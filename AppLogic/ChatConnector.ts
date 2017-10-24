/// <reference path='IChatEventHandler.ts'/>

const BeamClient = require('beam-client-node');
const BeamSocket = require('beam-client-node/lib/ws');
const request = require('request');

class ChatConnector
{
    private m_client = new BeamClient();
    private m_handler : IChatEventHandler;

    constructor(handler : IChatEventHandler)
    {
        this.m_handler = handler;
    }

    public Connect(channelId : number) 
    {
        // Join the room.
        this.m_client.chat.join(channelId)

        .then(response => {
            // Create the socket and connect.
            const body = response.body;   
            return this.createChatSocket(channelId, body.endpoints);
        })

        .catch(error => {
            console.log('Something went wrong:', error);
        });

        // request(`https://mixer.com/api/v1/chats/${channelId}/users`,  function (error, response, body) {
        //     console.log(response);
        // });

        // Kick off a task to get the current users.
        // https://mixer.com/api/v1/chats/257925/users?limit=50&page=0
    }

    private createChatSocket (channelId : number, endpoints : string[]) {

        // Chat connection
        const socket = new BeamSocket(endpoints).boot();

        // Greet a joined user
        socket.on('UserJoin', data => {
            console.log(`User Joined ${data.username}`);
            this.m_handler.OnUserJoined(data.username);
        });

        socket.on('UserLeave', data => {
            console.log(`User Left ${data.username}`);
            this.m_handler.OnUserLeft(data.username);
        })

        // React to our !pong command
        socket.on('ChatMessage', data => {
            console.log("Chat Message: " + data.message.message[0].data);
            this.m_handler.OnUserChatted(data.user_name);
        });

        // Handle errors
        socket.on('error', error => {
            console.error('Socket error', error);
        });

        return socket.auth(channelId, null, null)
        .then(() => {
            console.log('Chat connect successful.');
        });
    }
}