// let userInfo;
// const client = new BeamClient();
// var OAuth = require('oauth2-client-js');
// var mixer = new OAuth.Provider({
//     id: 'mixer',   // required
//     authorization_url: 'https://mixer.com/oauth/authorize' // required
// });
// // Create a new request
// var request = new OAuth.Request({
//     client_id: 'a74577f4ea15f1b12130015e89adae7fce611aafa5a487ef',  // required
//     redirect_uri: 'https://www.quinndamerell.com/return.html',
//     scope:'chat:connect chat:chat chat:bypass_slowchat'
// });
// // Give it to the provider
// var uri = mixer.requestToken(request);
// // Later we need to check if the response was expected
// // so save the request
// mixer.remember(request);
// // Do the redirect
// oauth = window.open(uri, "SignIn", "width=780,height=410,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0,left=" + 300 + ",top=" + 300);
// function afterOauth()
// {
//     //if(oauth.location.href.indexOf("quinndamerell.com"))
//     {
//         //var response = mixer.parse(oauth.location.href);
//     }
//     // else
//     // {
//     //     setTimeout(afterOauth, 1000)
//     // }
// }
// setTimeout(afterOauth, 1000)
