import express, { Request, Response } from 'express'
const { isAuthenticated, getUserType } = require('../tokenVerify') 
const path = require('path')

const router = express.Router()


router.get('/principal', isAuthenticated, async (req: Request, res: Response)=> {
    const userType = await getUserType(req, res)
    res.render((path.resolve(__dirname, '..', '..', 'protected', 'users', userType , 'html', 'principal')));
})

// Retorna o html do usuário logado
router.get('/relevantes', isAuthenticated, async (req: Request, res: Response)=> {
    const userType = await getUserType(req, res)
    res.render((path.resolve(__dirname, '..', '..', 'protected', 'users', userType , 'html', 'relevantes')));
})

router.get('/escolhas', isAuthenticated, async (req: Request, res: Response)=> {
    const userType = await getUserType(req, res)
    res.render((path.resolve(__dirname, '..', '..', 'protected', 'users', userType , 'html','escolhas')));
})

router.use(function(req, res, next) {
    res.status(404)
    res.render('404')
});

module.exports = router;