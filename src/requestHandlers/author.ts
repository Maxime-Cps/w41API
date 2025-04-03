import {Request, Response} from 'express';
import {prisma} from '../db';
import {NotFoundError} from '../error';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime/library';
import {assert} from 'superstruct';
import {AuthorCreationData, AuthorQueryParams, AuthorUpdateData} from '../validation/author';
import {Prisma} from '@prisma/client';

function getCount(filter: Prisma.AuthorWhereInput) {
    return prisma.author.count({
        where: filter
    });
}

export async function get_all(req: Request, res: Response) {
    assert(req.query, AuthorQueryParams);
    const { lastnameInput, hasBooks, include, skip, take } = req.query;
    const filter: Prisma.AuthorWhereInput = {};

    if (lastnameInput) {
        filter.lastname = { contains: String(lastnameInput) };
    }

    if (hasBooks === 'true') {
        filter.Book = { some: {} };
    }

    const includeOption: Prisma.AuthorInclude = {};
    if (include === 'books') {
        includeOption.Book = {
            select: {
                id: true,
                titlename: true
            },
            orderBy: {
                titlename: 'asc'
            }
        };
    }

    const authors = await prisma.author.findMany({
        where: filter,
        orderBy: {
            lastname: 'asc'
        },
        include: includeOption,
        skip: skip ? parseInt(String(skip)) : 0,
        take: take ? parseInt(String(take)) : 10
    });

    const totalCount = await getCount(filter);

    res.set('X-Total-Count', totalCount.toString());
    res.json(authors);
}

export async function get_one(req: Request, res: Response) {
    const authorId = parseInt(req.params.author_id);
    const author = await prisma.author.findUnique({
        where: {
            id: authorId
        }
    });
    if(author){
        res.json(author);
    } else {
        res.status(404).end('Author not found');
    }
}

export async function create_one(req: Request, res: Response) {
    assert(req.body, AuthorCreationData);
    try {
        const author = await prisma.author.create({
            data: {
                firstname : req.body.firstname,
                lastname : req.body.lastname,
            },
        });
        res.status(201).json(author);
    } catch (err: unknown) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Author not created');
        }
        throw err;
    }
}

export async function update_one(req: Request, res: Response) {
    assert(req.body, AuthorUpdateData);
    try {
        const author = await prisma.author.update({
            where: {
                id: req.body.id
            },
            data: {
                firstname : req.body.firstname,
                lastname : req.body.lastname,
            }
        })
        res.status(200).json(author);
    } catch (err: unknown) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Author not found');
        }
        throw err;
    }
}

export async function delete_one(req: Request, res: Response) {
    const authorId = parseInt(req.params.author_id);
    try {
        const author = await prisma.author.delete({
            where: {
                id: authorId
            }
        })
        res.status(204).end('No Content');
    } catch (err: unknown) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
            throw new NotFoundError('Author not found');
        }
        throw err;
    }
}