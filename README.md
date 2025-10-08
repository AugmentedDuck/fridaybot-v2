# FRIDAY BOT

Made with NodeJS

## How to use (This may be out of date)
1) Run **npm install**
2) Make a **.secrets** folder and fill with
    - **botMods.json** (who can run bot admin commands e.g. "debug api")
        - { "botMods": ["\*DISCORD USER ID\*"] }
    - **config.json** (Bot authentication)
        - { "token": "\*DISCORD BOT TOKEN\*", "clientId": "\*DISCORD BOT CLIENTID\*" }
    - **credentials.json** (Spotify Credentials)
        - { "clientId": "\*SPOTIFY CLIENT ID\*", "clientSecret": "\*SPOTIFY CLIENT SECRET\*" }
3) Make **.libs** folder and fill with
    - **babbler.txt**
        - This should contain a lot of text that the babbler will use to generate random sentences
