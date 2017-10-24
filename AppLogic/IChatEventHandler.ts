interface IChatEventHandler
{
    // Called when a new user list is found.
    OnUserRefresh(activeUsers : string[]);

    // Called when a new user joins
    OnUserJoined(userName : string);

    // Called when a user leaves.
    OnUserLeft(userName: string);

    // Called when a user chats
    OnUserChatted(userName : string);
}