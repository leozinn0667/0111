import express, { Request, Response } from 'express';
const path = require('path')
const mongoose = require('mongoose')
const {loginRedirect} = require('./tokenVerify')
require('dotenv').config();

const app = express();
const serverURL = process.env.SERVER_URL || "localhost";
const port = process.env.PORT || 3000;

const files = require('./routes/files')
const pages = require('./routes/pages')
const scripts = require('./routes/scripts')
const auth  = require('./routes/auth')

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, '..', 'public')));
app.set('views', path.join(__dirname, '..', 'views'));

// Routes
app.use('/files', files)
app.use('/pages', pages)
app.use('/scripts', scripts)
app.use('/auth', auth)

app.get('/', (req: Request, res: Response)=> {
    res.render('index')
})

app.get('/login', loginRedirect,(req: Request, res: Response)=> {
    res.render('login')
})

app.use(function(req, res, next) {
    res.status(404)
    res.render('404')   
});
  

mongoose.connect(process.env.MONGO_URI || 'Erro no DB_URI' ).then(() => {
    console.log('✅ Conectado ao banco de dados.')
    app.listen(port, () => console.log(`✅ Server online -> http://${serverURL}:${port}/`))
}).catch((error: any) => {
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