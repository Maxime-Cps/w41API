import {Request, Response} from 'express';
import {prisma} from '../db';
import {NotFoundError} from '../error';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime/library';
import {assert} from 'superstruct';
import {Prisma} from '@prisma/client';

export async function get_average_rating_of_book(req: Request, res: Response) {
    try {
        const bookId = parseInt(req.params.book_id);
        const ratings = await prisma.rating.aggregate({
            where: {
                bookId
            },
            _avg: {
                value: true,
            },
        });
        res.json(ratings._avg.value);

    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Rating not found');
        }
        throw err;
    }
}


export async function create_rating(req: Request, res: Response): Promise<void> {
    const { value } = req.body;

    // Validation de la valeur de la note
    if (value < 0 || value > 5) {
        res.status(400).json({ error: 'Rating value must be between 0 and 5' });
        return;
    }


    try {
        const rating = await prisma.rating.create({
            data: {
                value: req.body.value,
                book: {
                    connect: { id: req.body.book_id }
                },
                creator: {
                    connect: { id: req.body.user_id }
                }
            }
        });
        res.status(201).end('Created');
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Rating not created');
        }
        throw err;
    }
}

export async function get_all_ratings_of_book(req: Request, res: Response) {
    try {
        const bookId= parseInt(req.params.book_id);
        const ratings = await prisma.rating.findMany({
            where: {
                bookId
            }
        });
        res.json(ratings);
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Rating not found');
        }
        throw err;
    }
}

export async function update_rating(req: Request, res: Response){
    try {
        const ratingId = parseInt(req.params.rating_id)
        const rating = await prisma.rating.findUnique({
            where: {
                id: ratingId
            }
        });

        if (!rating) {
            res.status(404).json('Comment not found');
            return;
        }

        if (rating.userId !== req.body.user_id) {
            res.status(403).json('Unauthorized');
            return;
        }

        const updatedRating = prisma.rating.update({
            where: {id: ratingId},
            data: {
                value: req.body.value
            }
        });

        res.status(401).json(updatedRating);
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Rating not updated');
        }
        throw err;
    }
}

export async function delete_rating(req: Request, res: Response) {
    try {
        const ratingId = parseInt(req.params.rating_id)
        const rating = await prisma.rating.findUnique({
            where: {
                id: ratingId
            }
        });

        if (!rating) {
            res.status(404).json('Comment not found');
            return;
        }

        if (rating.userId !== req.body.user_id) {
            res.status(403).json('Unauthorized');
            return;
        }

        await prisma.rating.delete({
            where: {
                id: ratingId
            }
        });

        res.status(401).end('Rating deleted');
    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Rating not updated');
        }
        throw err;
    }
}