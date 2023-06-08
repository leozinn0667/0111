import express, { NextFunction, Request, Response } from 'express'
import { getDate } from '../getDate'
import { listUsers } from '../listUsers';
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')
require('dotenv').config();
const SECRET = process.env.MONGO_PASS
const ADMIN = process.env.MONGO_PASS

const router = express.Router()
const User = require('../models/User')

// Middlewares
router.use(express.json())
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body

    // validations 
    if (!username || !password) return

    const userData = await User.findOne({ username: username })
    if (!userData) return res.json({"statusLogin": "404"})

    // password verify
    let auth
    await bcrypt.compare(password, userData.password).then((x: Boolean) => { auth = x })

    if (auth) {
        // update lasLogin
        userData.lastLogin = getDate()
        await userData.save()
        .catch((error: any) => { console.log(`Erro ao salvar lastLogin: ${error}`)})
        
        // create cookie with JWT token
        const token = jwt.sign({
            userType: userData.userType
        }, SECRET, { expiresIn: 600}) // segundos

        res.cookie('token', token, { 
            maxAge: 600000, // tempo de vida do cookie em milissegundos
            httpOnly: true, // impede acesso via JavaScript no cliente
        });


        // response
        res.json({
            token: token,
            statusLogin: "202",
            redirect: "/pages/principal"
        })

    } else {
        res.json({"statusLogin": "401"})
    }


})

router.get('/logout', async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie('token');
    res.redirect('/')
});

router.post('/register', async (req: Request, res: Response) => {
    const { adminKey, username, password } = req.body
    const users = await listUsers()
    let { userType } = req.body

    // validations
    if (Object.keys(req.body).length === 0) { return res.status(204) } // 204 = No content
    if (!ADMIN || adminKey != ADMIN) { return res.status(422).json({ response: 'Chave admin inválida.' }) }
    if (username && password == 'delete') { deleteUser(); return } // aqui "userType" não é necessária pra deletar user 
    if (!username || !password || !userType) { return res.status(422).json({ response: 'Existem dados de login faltando.' }) }
    if (typeof userType != 'string') { userType = userType.toString(); };
    if (!users.includes(userType)) { return res.status(404).json({ response: 'userType inválido.' } ) }

    const userExists = await User.findOne({ username: username })
    if (userExists && password != 'delete') { return res.status(409).json({ response: 'Usuário já cadastrado.' }) }

    // bcrypt
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    // create user
    const user = new User({
        username,
        password: passwordHash,
        userType: userType,
        lastLogin: getDate()
    })

    try {
        await user.save()
        res.status(201).json({ response: "usuario criado" })
    } catch (error) {
        res.status(500).json({ response: "Erro ao criar usuário (500)" })
        console.log(`Erro ao criar usuário: ${error}`)
    }

    // Delete user function
    async function deleteUser() {
        try {
            await User.deleteOne({ username: username })
            return res.status(202).json({ response: `Usuário ${username} deletado.` })
        } catch (error) {
            console.log(`Erro ao deletar usuário: ${error}`)
            return res.status(500).json({ response: "Erro ao deletar usuário" })
        }
    }

})

router.get('/userlist', async (req: Request, res: Response) => {
    let userlist: any[] = []
    const usuarios = await User.find();
    usuarios.forEach((usuario: { username: string; lastLogin: Date; }) => {
      userlist.push({ username: usuario.username, lastLogin: usuario.lastLogin });
    });    
    
    res.send(userlist)
});

module.exports = router