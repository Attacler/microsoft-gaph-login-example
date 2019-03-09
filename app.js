const app = require('express')();
const session = require('express-session');
const auth = require('./auth');
const request = require('superagent');

app.use(session({
    secret: 'thisisasecretKey',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 604800000
    }
}));

app.get('/login', async (req, res) => {

    const tokens = await auth.getTokenFromCode(req.query.code);

    if (tokens.e) {
        res.end("An error happend: \n" + tokens.e);
    } else {
        const acc = await new Promise((resolve) => {
            //send a request to get user data
            request
                .get('https://graph.microsoft.com/beta/me')
                .set('Authorization', 'Bearer ' + tokens.accessToken)
                .end((err, res) => {
                    if (err) {
                        resolve(err);
                    } else {
                        resolve(res.body);
                    }
                });
        });

        if (acc.mail != undefined) {
            //see result.json for all the information it gives you
            req.session.email = acc.mail;
            req.session.displayName = acc.displayName;

            console.log(acc.mailNickname, "Has logged in!");
        }

        res.redirect("/");
    }
})

app.get('/trylogin', (req, res) => {
    //redirect visitor to the right login url
    res.redirect(auth.getAuthUrl());
})

app.get('/', (req, res) => {
    if (req.session.email != undefined) {
        res.end("Logged in!" + req.session.email);
    } else {
        res.end("<a href='/trylogin'>Click here to login</a>");
    }
})

app.listen(3000);