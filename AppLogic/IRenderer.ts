/// <reference path='UserManager.ts'/>

interface IRenderer
{
    // Adds a user to the UI.
    AddUser(user : User);

    // Removes a user from the UI.
    RemoveUser(user : User);
}