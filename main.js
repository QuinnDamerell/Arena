/// <reference path='UserManager.ts'/>
/// <reference path='IChatEventHandler.ts'/>
/// <reference path='IRenderer.ts'/>
var User = /** @class */ (function () {
    function User(userName) {
        this.c_radius = 5;
        this.m_userName = userName;
        // Create the element.
        this.m_drawingElement = new fabric.Circle({
            radius: this.c_radius,
            fill: '#37AAD5'
        });
    }
    User.prototype.GetName = function () {
        return this.m_userName;
    };
    User.prototype.GetWidth = function () {
        return this.c_radius * 2;
    };
    User.prototype.GetHeight = function () {
        return this.c_radius * 2;
    };
    User.prototype.SetPosition = function (top, left) {
        this.m_top = top;
        this.m_left = left;
        this.m_drawingElement.top = this.m_top;
        this.m_drawingElement.left = this.m_left;
    };
    User.prototype.AddToCanvas = function (canvas) {
        canvas.add(this.m_drawingElement);
        this.m_canvas = canvas;
    };
    User.prototype.RemoveFromCanvas = function (canvas) {
        canvas.remove(this.m_drawingElement);
    };
    User.prototype.AnimateColor = function () {
        // Animate.
        // this.m_drawingElement.animate('fill', '#FFFFFF', {
        //     onChange: function (){
        //         console.log("chane");
        //     },
        //     duration: 1000,
        //     easing: fabric.util.ease.easeOutCubic
        // });
        var local = this;
        this.m_drawingElement.fill = "red";
        this.m_drawingElement.animate('radius', this.c_radius + 2, {
            onChange: this.m_canvas.renderAll.bind(this.m_canvas),
            duration: 500,
            easing: fabric.util.ease.easeInCubic,
            onComplete: function () {
                local.m_drawingElement.fill = "#37AAD5";
                local.m_drawingElement.animate('radius', local.c_radius, {
                    onChange: local.m_canvas.renderAll.bind(local.m_canvas),
                    duration: 500,
                    easing: fabric.util.ease.easeOutCubic
                });
            }
        });
    };
    User.prototype.AnimateX = function (canvas, ammount) {
        // Update the actual position.
        this.m_left += ammount;
        // Animate.
        this.m_drawingElement.animate('left', this.m_left, {
            onChange: canvas.renderAll.bind(canvas),
            duration: 1000,
            easing: fabric.util.ease.easeOutCubic
        });
    };
    User.prototype.AnimateIn = function (canvas) {
        this.m_drawingElement.animate('radius', this.c_radius, {
            onChange: canvas.renderAll.bind(canvas),
            duration: 1000,
            from: 0,
            easing: fabric.util.ease.easeOutBounce
        });
        this.m_drawingElement.animate('top', this.m_top, {
            onChange: canvas.renderAll.bind(canvas),
            duration: 1000,
            from: this.m_top + this.c_radius,
            easing: fabric.util.ease.easeOutBounce
        });
        this.m_drawingElement.animate('left', this.m_left, {
            onChange: canvas.renderAll.bind(canvas),
            duration: 1000,
            from: this.m_left + this.c_radius,
            easing: fabric.util.ease.easeOutBounce
        });
    };
    User.prototype.AnimateOut = function (canvas) {
        this.m_drawingElement.animate('radius', 0, {
            onChange: canvas.renderAll.bind(canvas),
            duration: 1000,
            easing: fabric.util.ease.easeOutBounce
        });
        this.m_top += this.c_radius;
        this.m_drawingElement.animate('top', this.m_top, {
            onChange: canvas.renderAll.bind(canvas),
            duration: 1000,
            easing: fabric.util.ease.easeOutBounce
        });
        this.m_left += this.c_radius;
        this.m_drawingElement.animate('left', this.m_left, {
            onChange: canvas.renderAll.bind(canvas),
            duration: 1000,
            easing: fabric.util.ease.easeOutBounce
        });
    };
    return User;
}());
var UserManager = /** @class */ (function () {
    function UserManager(renderer) {
        this.m_users = {};
        this.m_renderer = renderer;
    }
    // Called when a new user list is found.
    UserManager.prototype.OnUserRefresh = function (activeUsers) {
    };
    // Called when a new user joins
    UserManager.prototype.OnUserJoined = function (newUser) {
        var user = new User(newUser);
        this.m_users[newUser] = user;
        this.m_renderer.AddUser(user);
    };
    // Called when a user leaves.
    UserManager.prototype.OnUserLeft = function (userName) {
        // Find the user
        var user = this.m_users[userName];
        if (user == null) {
            return;
        }
        this.m_renderer.RemoveUser(user);
        this.m_users[userName] = null;
    };
    UserManager.prototype.OnUserChatted = function (userName) {
        var user = this.m_users[userName];
        if (user == null) {
            return;
        }
        user.AnimateColor();
    };
    return UserManager;
}());
/// <reference path='IChatEventHandler.ts'/>
var BeamClient = require('beam-client-node');
var BeamSocket = require('beam-client-node/lib/ws');
var request = require('request');
var ChatConnector = /** @class */ (function () {
    function ChatConnector(handler) {
        this.m_client = new BeamClient();
        this.m_handler = handler;
    }
    ChatConnector.prototype.Connect = function (channelId) {
        var _this = this;
        // Join the room.
        this.m_client.chat.join(channelId)
            .then(function (response) {
            // Create the socket and connect.
            var body = response.body;
            return _this.createChatSocket(channelId, body.endpoints);
        })["catch"](function (error) {
            console.log('Something went wrong:', error);
        });
        // request(`https://mixer.com/api/v1/chats/${channelId}/users`,  function (error, response, body) {
        //     console.log(response);
        // });
        // Kick off a task to get the current users.
        // https://mixer.com/api/v1/chats/257925/users?limit=50&page=0
    };
    ChatConnector.prototype.createChatSocket = function (channelId, endpoints) {
        var _this = this;
        // Chat connection
        var socket = new BeamSocket(endpoints).boot();
        // Greet a joined user
        socket.on('UserJoin', function (data) {
            console.log("User Joined " + data.username);
            _this.m_handler.OnUserJoined(data.username);
        });
        socket.on('UserLeave', function (data) {
            console.log("User Left " + data.username);
            _this.m_handler.OnUserLeft(data.username);
        });
        // React to our !pong command
        socket.on('ChatMessage', function (data) {
            console.log("Chat Message: " + data.message.message[0].data);
            _this.m_handler.OnUserChatted(data.user_name);
        });
        // Handle errors
        socket.on('error', function (error) {
            console.error('Socket error', error);
        });
        return socket.auth(channelId, null, null)
            .then(function () {
            console.log('Chat connect successful.');
        });
    };
    return ChatConnector;
}());
/// <reference path='IRenderer.ts'/>
var Border = /** @class */ (function () {
    function Border(canvas, height, width, top, left) {
        this.c_borderOpacity = .8;
        this.c_elementPadding = 4;
        this.m_userList = Array();
        this.m_height = height;
        this.m_width = width;
        this.m_top = top;
        this.m_left = left;
        this.m_canvas = canvas;
        // Draw the border shape.
        var m_border = new fabric.Rect({
            left: this.m_left,
            top: this.m_top,
            fill: '#141828',
            opacity: this.c_borderOpacity,
            width: this.m_width,
            height: this.m_height
        });
        canvas.add(m_border);
    }
    Border.prototype.AddUser = function (user) {
        // Update the position.
        // The extra element padding to to pad the first element left.
        user.SetPosition(this.m_top + this.c_elementPadding, this.m_userList.length * (user.GetWidth() + this.c_elementPadding) + this.c_elementPadding);
        // Add the user
        this.m_userList.push(user);
        // Add to the canvas
        user.AddToCanvas(this.m_canvas);
        // Animate in
        user.AnimateIn(this.m_canvas);
    };
    Border.prototype.RemoveUser = function (user) {
        var c = 0;
        var shiftAmmount = -1;
        for (; c < this.m_userList.length; c++) {
            if (this.m_userList[c].GetName() === user.GetName()) {
                // Remove the user.
                user.AnimateOut(this.m_canvas);
                this.m_userList.splice(c, 1);
                shiftAmmount = user.GetWidth() + this.c_elementPadding;
                // Decrement c to make sure the element in the slot gets moved.
                c--;
                continue;
            }
            // If we found our element shift the rest over.
            if (shiftAmmount !== -1) {
                this.m_userList[c].AnimateX(this.m_canvas, -shiftAmmount);
            }
        }
    };
    return Border;
}());
var Renderer = /** @class */ (function () {
    function Renderer() {
        this.m_circleRaduis = 10;
        this.m_borderSize = 18;
    }
    Renderer.prototype.Setup = function (height, width) {
        this.m_width = width;
        this.m_height = height;
        var canvas = new fabric.StaticCanvas('ui_MainCanvas', { width: width, height: height });
        // Draw a background for debugging.
        // var background = new fabric.Rect({
        //     left: 0,
        //     top: 0,
        //     fill: 'gray',
        //     width: width,
        //     height: height
        //   });
        //   canvas.add(background);  
        // Create our one border.
        this.m_border = new Border(canvas, this.m_borderSize, width, this.m_height - this.m_borderSize, 0);
    };
    Renderer.prototype.AddUser = function (user) {
        this.m_border.AddUser(user);
    };
    Renderer.prototype.RemoveUser = function (user) {
        this.m_border.RemoveUser(user);
    };
    return Renderer;
}());
/// <reference path='UserManager.ts'/>
/// <reference path='ChatConnector.ts'/>
/// <reference path='Renderer.ts'/>
var Arena = /** @class */ (function () {
    function Arena() {
    }
    Arena.prototype.Start = function () {
        // Get the args
        var url = new URL(window.location.href);
        var height = parseInt(url.searchParams.get("height"));
        if (isNaN(height)) {
            this.ShowError("Invalid Height!");
            return;
        }
        var width = parseInt(url.searchParams.get("width"));
        if (isNaN(width)) {
            this.ShowError("Invalid Width!");
            return;
        }
        var channelId = parseInt(url.searchParams.get("channel"));
        if (isNaN(channelId)) {
            this.ShowError("Invalid Channel Id!");
            return;
        }
        // Start the render
        this.m_renderer = new Renderer();
        this.m_renderer.Setup(height, width);
        // Setup the manager
        this.m_userMan = new UserManager(this.m_renderer);
        // Start the connector.
        this.m_chatConnector = new ChatConnector(this.m_userMan);
        this.m_chatConnector.Connect(channelId);
    };
    Arena.prototype.ShowError = function (error) {
        var errElm = document.getElementById('ui_error');
        errElm.innerText = "Error:" + error;
        errElm.style.display = 'block';
    };
    return Arena;
}());
var arena = new Arena();
window.onload = function () {
    arena.Start();
};
//# sourceMappingURL=Main.js.map