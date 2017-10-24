const BeamClient = require('beam-client-node');
const BeamSocket = require('beam-client-node/lib/ws');

let userInfo;

const client = new BeamClient();

var OAuth = require('oauth2-client-js');
var mixer = new OAuth.Provider({
    id: 'mixer',   // required
    authorization_url: 'https://mixer.com/oauth/authorize' // required
});

// Create a new request
var request = new OAuth.Request({
    client_id: 'a74577f4ea15f1b12130015e89adae7fce611aafa5a487ef',  // required
    redirect_uri: 'https://www.quinndamerell.com/return.html',
    scope:'chat:connect chat:chat chat:bypass_slowchat'
});

// Give it to the provider
var uri = mixer.requestToken(request);

// Later we need to check if the response was expected
// so save the request
mixer.remember(request);

// Do the redirect
oauth = window.open(uri, "SignIn", "width=780,height=410,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0,left=" + 300 + ",top=" + 300);


function afterOauth()
{
    //if(oauth.location.href.indexOf("quinndamerell.com"))
    {
        //var response = mixer.parse(oauth.location.href);

        client.use('oauth', {
            tokens: {
                access: '4s7haBXos0YUOPfSMeGPQ4AyAwHQk4aak2UiizWlmoVzsMhRpYZKsetm8bZFNbYV',
                expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
            },
        });

        
        // Get's the user we have access to with the token
        client.request('GET', `users/current`)
        .then(response => {
            userInfo = response.body;
            return client.chat.join(response.body.channel.id);
        })
        .then(response => {
            const body = response.body;
            return createChatSocket(userInfo.id, userInfo.channel.id, body.endpoints, body.authkey);
        })
        .catch(error => {
            console.log('Something went wrong:', error);
        });

    }
    // else
    // {
    //     setTimeout(afterOauth, 1000)
    // }
}

setTimeout(afterOauth, 1000)



/**
 * Creates a beam chat socket and sets up listeners to various chat events.
 * @param {number} userId The user to authenticate as
 * @param {number} channelId The channel id to join
 * @param {any} endpoints An endpoints array from a beam.chat.join call.
 * @param {any} authkey An authentication key from a beam.chat.join call.
 * @returns {Promise.<>}
 */
function createChatSocket (userId, channelId, endpoints, authkey) {
    // Chat connection
    const socket = new BeamSocket(endpoints).boot();

    // Greet a joined user
    socket.on('UserJoin', data => {
        socket.call('msg', [`Hi ${data.username}! I'm pingbot! Write !ping and I will pong back!`]);
    });

    // React to our !pong command
    socket.on('ChatMessage', data => {
        if (data.message.message[0].data.toLowerCase().startsWith('!ping')) {
            socket.call('msg', [`@${data.user_name} PONG!`]);
            console.log(`Ponged ${data.user_name}`);
        }
    });

    // Handle errors
    socket.on('error', error => {
        console.error('Socket error', error);
    });

    return socket.auth(channelId, userId, authkey)
    .then(() => {
        console.log('Login successful');
        return socket.call('msg', ['Hi! I\'m pingbot! Write !ping and I will pong back!']);
    });
}