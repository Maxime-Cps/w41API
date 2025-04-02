import { Request, Response } from 'express';
import { prisma } from '../db';
import { NotFoundError } from '../error';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {assert} from "superstruct";
import {BookCreationData, BookUpdateData, BooksQueryParams, AuthorBooksQueryParams} from "../validation/book";
import { Prisma } from '@prisma/client';

function getCount(filter: Prisma.BookWhereInput){
    return prisma.book.count({
        where: filter
    });
}

/// Avoir tous les livres
export async function get_all(req: Request, res: Response) {
    assert(req.query, BooksQueryParams);
    const {titlenameInput, include, skip, take} = req.query;
    const filter: Prisma.BookWhereInput = {};
    const includeOptions: Prisma.BookInclude = {};

    if (titlenameInput) {
        filter.titlename = {contains: String(titlenameInput)};
    }

    if (include === 'author') {
        includeOptions.author = {
            select: {
                id: true,
                firstname: true,
                lastname: true
            }
        };
    }

    const books = await prisma.book.findMany({
        skip: skip ? parseInt(String(skip)) : 0,
        take: take ? parseInt(String(take)) : 5,
        where: filter,
        orderBy: {
            titlename: 'asc'
        },
        include: includeOptions
    });

    const totalCount = await getCount(filter);

    res.set('X-Total-Count', totalCount.toString());
    res.json(books);
}

// Avoir un livre
export async function get_one(req: Request, res: Response) {
    const bookId = parseInt(req.params.book_id);
    const book = await prisma.book.findUnique({
        where: {
            id: bookId
        }
    });
    if(book){
        res.json(book);
    } else {
        res.status(404).end('Book not found');
    }
}

// Avoir tous les livres d'un auteur
export async function get_all_of_author(req: Request, res: Response) {
    try {
        assert(req.query, AuthorBooksQueryParams);
        const {titlenameInput, skip, take} = req.query;
        const authorId = parseInt(req.params.author_id);
        const filter: Prisma.BookWhereInput = {
            authorId: authorId
        };

        if (titlenameInput) {
            filter.titlename = {contains: String(titlenameInput)};
        }

        const booksOfAuthor = await prisma.book.findMany({
            where: filter,
            orderBy: {
                titlename: 'asc'
            },
            skip: parseInt(String(skip)),
            take: parseInt(String(take)),
        });

        const totalCount = await getCount(filter);
        res.set('X-Total-Count', totalCount.toString());
        res.json(booksOfAuthor);
    } catch (err: unknown) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Author not found');
        }
        console.error(err);
        res.status(500).send('Internal server error');
    }
}

// Créer un livre pour un auteur
export async function create_one(req: Request, res: Response) {
    assert(req.body, BookCreationData);
    try {
        const newbook = await prisma.book.create({
            data: {
                titlename: req.body.titlename,
                publication_year: req.body.publication_year,
                author: {
                    connect: {
                        id: parseInt(req.params.author_id)
                    }
                },
            }
        })
        res.status(201).end('Created');
    } catch (err: unknown) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Author not found');
        }
        throw err;
    }
}

// Mettre à jour un livre
export async function update_one(req: Request, res: Response) {
    assert(req.body, BookUpdateData);
    try {
        const bookToUpdate = await prisma.book.update({
            where: {
                id: parseInt(req.params.book_id)
            },
            data: {
                titlename: req.body.titlename,
                authorId: req.body.authorId,
                publication_year: req.body.publication_year
            }
        });
        res.status(200).json(bookToUpdate);
    } catch (err: unknown) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Book not found');
        }
        throw err;
    }
}


// Supprimer un livre
export async function delete_one(req: Request, res: Response) {
    try {
        const author = await prisma.book.delete({
            where: {
                id: parseInt(req.params.book_id)
            }
        })
        res.status(204).end('No Content');
    } catch (err: unknown) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Book not found');
        }
        throw err;
    }
}