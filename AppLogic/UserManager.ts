/// <reference path='IChatEventHandler.ts'/>
/// <reference path='IRenderer.ts'/>

class User
{
    private c_radius = 5;
    
    private m_userName : string;
    private m_drawingElement;
    private m_canvas; 

    // We keep track of top and left not relying on the drawing element
    // so we know what value we want to achieve, which make it so if we interupt
    // an animation with another everything is still fine.
    private m_top : number;
    private m_left : number;

    constructor(userName : string)
    {
        this.m_userName = userName;

        // Create the element.
        this.m_drawingElement = new fabric.Circle({
            radius: this.c_radius,
            fill: '#37AAD5'
            });
    }

    public GetName() : string
    {
        return this.m_userName;
    }

    public GetWidth() : number
    {
        return this.c_radius * 2;
    }

    public GetHeight() : number
    {
        return this.c_radius * 2;        
    }

    public SetPosition(top : number, left : number)
    {
        this.m_top = top;
        this.m_left = left;
        this.m_drawingElement.top = this.m_top;
        this.m_drawingElement.left = this.m_left;
    }

    public AddToCanvas(canvas)
    {
        canvas.add(this.m_drawingElement);
        this.m_canvas = canvas;
    }

    public RemoveFromCanvas(canvas)
    {
        canvas.remove(this.m_drawingElement);
    }

    public AnimateColor()
    {
        // Animate.
        // this.m_drawingElement.animate('fill', '#FFFFFF', {
        //     onChange: function (){
        //         console.log("chane");
        //     },
        //     duration: 1000,
        //     easing: fabric.util.ease.easeOutCubic
        // });
        let local = this;
        this.m_drawingElement.fill = "red";
        this.m_drawingElement.animate('radius', this.c_radius + 2, {
            onChange: this.m_canvas.renderAll.bind(this.m_canvas),
            duration: 500,
            easing: fabric.util.ease.easeInCubic,
            onComplete: function()
            {
                local.m_drawingElement.fill = "#37AAD5";        
                local.m_drawingElement.animate('radius', local.c_radius, {
                    onChange: local.m_canvas.renderAll.bind(local.m_canvas),
                    duration: 500,
                    easing: fabric.util.ease.easeOutCubic
                  });
            }
          });
    }

    public AnimateX(canvas, ammount : number)
    {
        // Update the actual position.
        this.m_left += ammount;

        // Animate.
        this.m_drawingElement.animate('left', this.m_left, {
            onChange: canvas.renderAll.bind(canvas),
            duration: 1000,
            easing: fabric.util.ease.easeOutCubic
          });
    }

    public AnimateIn(canvas)
    {
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
    }

    public AnimateOut(canvas)
    {
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
    }
}

class UserManager implements IChatEventHandler
{
    private m_renderer : IRenderer;
    private m_users: {[key: string]: User} = {}

    constructor(renderer : IRenderer)
    {
        this.m_renderer = renderer;
    }

    // Called when a new user list is found.
    OnUserRefresh(activeUsers : string[])
    {

    }

    // Called when a new user joins
    OnUserJoined(newUser : string)
    {
        let user = new User(newUser);
        this.m_users[newUser] = user;
        this.m_renderer.AddUser(user);
    }

    // Called when a user leaves.
    OnUserLeft(userName: string)
    {
        // Find the user
        let user = this.m_users[userName];
        if(user == null)
        {
            return;
        }

        this.m_renderer.RemoveUser(user);    
        this.m_users[userName] = null; 
    }

    OnUserChatted(userName : string)
    {
        let user = this.m_users[userName];
        if(user == null)
        {
            return;
        }

        user.AnimateColor();
    }    
}