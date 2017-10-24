/// <reference path='IRenderer.ts'/>

class Border
{
    private c_borderOpacity = .8; 
    private c_elementPadding = 4; 
    
    private m_height;
    private m_width;
    private m_top;
    private m_left;
    private m_canvas;

    private m_userList = Array<User>();   

    constructor(canvas, height, width, top, left)
    {
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

    public AddUser(user : User)
    {
        // Update the position.
        // The extra element padding to to pad the first element left.
        user.SetPosition(this.m_top + this.c_elementPadding, this.m_userList.length * (user.GetWidth() + this.c_elementPadding) + this.c_elementPadding);

        // Add the user
        this.m_userList.push(user);

        // Add to the canvas
        user.AddToCanvas(this.m_canvas);

        // Animate in
        user.AnimateIn(this.m_canvas);
    }

    public RemoveUser(user : User)
    {
        let c : number = 0;
        let shiftAmmount : number = -1;
        for(; c < this.m_userList.length; c++)
        {
            if(this.m_userList[c].GetName() === user.GetName())
            {
                // Remove the user.
                user.AnimateOut(this.m_canvas);
                this.m_userList.splice(c, 1);              
                shiftAmmount = user.GetWidth() + this.c_elementPadding;

                // Decrement c to make sure the element in the slot gets moved.
                c--;
                continue;
            }

            // If we found our element shift the rest over.
            if(shiftAmmount !== -1)
            {
                this.m_userList[c].AnimateX(this.m_canvas, -shiftAmmount);
            }
        }
    }
}

class Renderer implements IRenderer
{
    private m_circleRaduis = 10;
    private m_borderSize = 18;
    
    private m_canvas;
    private m_height : number;
    private m_width : number;
    private m_border : Border;

    Setup(height: number, width: number)
    {
        this.m_width = width;
        this.m_height = height;
        var canvas = new fabric.StaticCanvas('ui_MainCanvas', { width: width, height:height });
        
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
    }

    AddUser(user : User)
    {
        this.m_border.AddUser(user);
    }

    RemoveUser(user : User)
    {
        this.m_border.RemoveUser(user);
    }
}