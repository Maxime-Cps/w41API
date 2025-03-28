import {prisma} from '../db';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime/library';
import validator from 'validator';

const bcrypt = require('bcrypt');
import jwt from 'jsonwebtoken';

import {Request, Response, NextFunction} from 'express';
import { expressjwt, Request as AuthRequest } from 'express-jwt';

export const auth_client = [
    expressjwt({
        secret: process.env.JWT_SECRET as string,
        algorithms: ['HS256'],
    }),
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        const user = await prisma.user.findUnique({
            where: { id: Number(req.auth?.id) }
        });
        if (user) {
            req.auth = user;
            next();
        } else {
            res.status(401).send('Invalid token');
        }
    }
];


export async function create_one(req: Request, res: Response):Promise<void>  {

    const { email, password } = req.body;

    // Vérification si l'email est valide
    if (!validator.isEmail(email)) {
        res.status(400).json('Email is not valid');
        return;
    }

    // Vérification si le mot de passe est de longueur suffisante
    if (!validator.isLength(password, {min: 8})) {
        res.status(400).json('Password must be at least 8 characters long');
        return;
    }

    try {
        const user = await prisma.user.create({
            data: {
                email: req.body.email,
                username: req.body.username,
                password: await bcrypt.hash(req.body.password, 12)
            },
            select: {
                id: true,
                email: true,
                username: true
            }
        });
        res.status(201).json({user});
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
            res.status(409).json({ error: 'Email already exists' });
            return
        }
        throw err;
    }
}

export async function connect(req: Request, res: Response):Promise<void>     {
    try {
        const { email, password } = req.body;

        // vérification si l'email donné existe dans la BDD
        const user = await prisma.user.findUnique({
            where: {email}
        });

        if (!user) {
            res.status(401).json('L\'email n\'existe pas');
            return
        }
        console.log('email trouvé');

        // vérification si le mdp donné correspond au mdp de la BDD
        const isPwdValid = await bcrypt.compare(password, user.password)
        if (!isPwdValid){
            res.status(401).json('Association Mdp/Email Invalides');
            return
        }

        console.log('mdp trouvé');

        //Génération du token d'auth
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string);

        // retour du token et de l'utilisateur
        const { password: _, ...userWithoutPwd } = user;
        res.json({ user: userWithoutPwd, token });
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            res.status(404).json({ error: 'User not found' });
            return
        }
        throw err;
    }
}


