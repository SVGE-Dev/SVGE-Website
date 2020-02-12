<!--[logo]: http://svge.uk/images/SVGE.png "SVGE Logo"

<div style="text-align: right">

![alt text][logo]

</div>-->
<center>

# Southampton Video Games and Esports Society
## SVGE Website

</center>

1. Install [Node](https://nodejs.org/en/).
2. CD into this folder and run `npm install`.
3. Copy `.env.sample` into a new `.env` file.
    1. Update the database settings as needed, ensuring the given database exists on the MySQL server.
    2. Set the port that the web server will run on.
    3. Add the Discord client ID and secret to allow for OAuth2 logins.
    4. Enter a random string for the session key.
    5. Ignore the Discord bot token field.
4. Run with `npm run start`.