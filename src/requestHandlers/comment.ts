import {Request, Response} from 'express';
import {prisma} from '../db';
import {NotFoundError} from '../error';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime/library';
import {assert} from 'superstruct';
import {Prisma} from '@prisma/client';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

export async function create_comment(req: Request, res: Response) {
    try {
        const comment = await prisma.comment.create({
            data: {
                content: req.body.content,
                creator: {
                    connect: { id: req.body.user_id }
                },
                book: {
                    connect: { id: req.body.book_id }
                }
            }
        });
        res.status(201).end('Created');
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Comment not created');
        }
        throw err;
    }
}

export async function get_all_comments_of_book(req: Request, res: Response) {
    try {
        const bookId = parseInt(req.params.book_id);
        const comments = await prisma.comment.findMany({
            where: {
                bookId
            }
        });
        res.json(comments);
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Comments not found');
        }
        throw err;
    }
}

export async function update_comment(req: Request, res: Response) {
    try {
        const commentId = parseInt(req.params.comment_id);
        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId,
            }
        });

        if (!comment) {
            res.status(404).json('Comment not found');
            return;
        }

        if (comment.userId !== req.body.user_id) {
            res.status(403).json('Unauthorized');
            return;
        }

        const updatedComment = await prisma.comment.update(
            {
                where: { id: commentId },
                data: {
                    content: req.body.content
                }
            }
        );

        res.status(401).json(updatedComment);

    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Comment not found');
        }
        throw err;
    }
}

export async function delete_comment(req: Request, res: Response) {
    try {
        const commentId = parseInt(req.params.comment_id);
        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId,
            }
        });

        if (!comment) {
            res.status(404).json('Comment not found');
            return;
        }

        if (comment.userId !== req.body.user_id) {
            res.status(403).json('Unauthorized');
            return;
        }

        await prisma.comment.delete({
            where: {
                id: commentId
            }
        });

        res.status(204).end('Comment deleted');
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Comment not found');
        }
        throw err;
    }
}