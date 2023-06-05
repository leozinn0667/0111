import express, { Request, Response } from 'express';
import path from 'path';
import mongoose from 'mongoose';
const session = require('express-session')
require('dotenv').config();
const app = express();

const files = require('./routes/files')
const pages = require('./routes/pages')
const scripts = require('./routes/scripts')
const auth  = require('./routes/auth')

const serverURL = process.env.SERVER_URL || "localhost";

const port = process.env.PORT || 3000;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static('public'));
app.set('views', path.join(__dirname, '../public'));

app.use(session({
    secret: 'secret',
    cookie: { maxAge: 10000 },
    saveUnitialized: false
}))

// Routes

app.use('/files', files)
app.use('/pages', pages)
app.use('/scripts', scripts)
app.use('/auth', auth)

app.get('/login', (req: Request, res: Response)=> {
    res.render('login')
})

app.get('/user', (req: any, res: Response) => {
    console.log(req.session);
    res.send(req.session.username)
})

function createCookie(req:any, res: any, username: any, userType: any) {
    req.session.authenticated = true
    req.session.username = username
    req.session.userType = userType
}

app.use(function(req, res, next) {
    res.status(404)
    res.render('404')   
});

export {createCookie}
  

mongoose.connect(process.env.MONGO_URI || 'Erro no DB_URI' ).then(() => {
    console.log('✅ Conectado ao banco de dados.')
    app.listen(port, () => console.log(`✅ Server online -> http://${serverURL}:${port}/`))
}).catch((error) => {
    console.log(`Erro na conexão com banco de dados: ${error}`)
})


// HTTPS (apenas para desenvolvimento, no deploy não é necessário pois é usado o SSL da própria hospedagem)

// const https = require('https')
// mongoose.connect(process.env.MONGO_URI || 'Erro no DB_URI' ).then(() => {
// https.createServer({
//     key: fs.readFileSync('./SSL/code.key'),
//     cert: fs.readFileSync('./SSL/code.crt'),
// }, app).listen(port, () => {
//     console.log(`✅ Server HTTPS online -> https://${serverURL}:${port}/`);
// })
// }).catch((error) => {
//     console.log(`Erro ao tentar iniciar: ${error}`)
// })