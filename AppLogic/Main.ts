
/// <reference path='UserManager.ts'/>
/// <reference path='ChatConnector.ts'/>
/// <reference path='Renderer.ts'/>

class Arena 
{
    private m_chatConnector : ChatConnector;
    private m_renderer : Renderer;
    private m_userMan : UserManager;

    Start()
    {
        // Get the args
        var url = new URL(window.location.href);
        var height = parseInt(url.searchParams.get("height"));
        if(isNaN(height))
        {
            this.ShowError("Invalid Height!");
            return;
        }
        var width = parseInt(url.searchParams.get("width"));
        if(isNaN(width))
        {
            this.ShowError("Invalid Width!");
            return;            
        }
        var channelId = parseInt(url.searchParams.get("channel"));
        if(isNaN(channelId))
        {
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
    }
    
    ShowError(error : string)
    {
        let errElm = document.getElementById('ui_error');
        errElm.innerText =  "Error:"+error;
        errElm.style.display = 'block';
    }
}

let arena = new Arena();
window.onload = () => {
    arena.Start();
};






