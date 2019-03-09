const   OAuth = require('oauth'),
        uuid = require('node-uuid'),
        fs = require('fs'),
        credentials = JSON.parse(fs.readFileSync("./config.json"));

function getAuthUrl() {
    return credentials.authority + credentials.authorize_endpoint +
        '?client_id=' + credentials.client_id +
        '&response_type=code' +
        '&redirect_uri=' + credentials.redirect_uri +
        '&scope=' + credentials.scope +
        '&response_mode=query' +
        '&nonce=' + uuid.v4() +
        '&state=abcd';
}

function getTokenFromCode(code) {
    return new Promise((resolve) => {
        const OAuth2 = OAuth.OAuth2;
        const oauth2 = new OAuth2(
            credentials.client_id,
            credentials.client_secret,
            credentials.authority,
            credentials.authorize_endpoint,
            credentials.token_endpoint
        );

        oauth2.getOAuthAccessToken(
            code, {
                grant_type: 'authorization_code',
                redirect_uri: credentials.redirect_uri,
                response_mode: 'form_post',
                nonce: uuid.v4(),
                state: 'abcd'
            },
            function (e, accessToken, refreshToken) {
                resolve({error: e, accessToken: accessToken, refreshToken: refreshToken});
            }
        );
    });
}

function getTokenFromRefreshToken(refreshToken, callback) {
    return new Promise((resolve) => {
        const OAuth2 = OAuth.OAuth2;
        const oauth2 = new OAuth2(
            credentials.client_id,
            credentials.client_secret,
            credentials.authority,
            credentials.authorize_endpoint,
            credentials.token_endpoint
        );
    
        oauth2.getOAuthAccessToken(
            refreshToken, {
                grant_type: 'refresh_token',
                redirect_uri: credentials.redirect_uri,
                response_mode: 'form_post',
                nonce: uuid.v4(),
                state: 'abcd'
            },
            function (e, accessToken) {
                resolve({error:e, accessToken:accessToken});
            }
        );
    })
}

module.exports = {
    getAuthUrl,
    getTokenFromCode,
    getTokenFromRefreshToken
}