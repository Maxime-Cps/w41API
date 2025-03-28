import { Request, Response } from 'express';
import { prisma } from '../db';
import { NotFoundError } from '../error';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {assert} from "superstruct";
import {TagCreationData, TagUpdateData} from "../validation/tag";

export async function get_all(req: Request, res: Response) {
    const tags = await prisma.tag.findMany();
    res.json(tags);
}

export async function create_one(req: Request, res: Response) {
    assert(req.body.name, TagCreationData)
    try {
        const tag = await prisma.tag.create({
            data: {
                name: req.body.name
            }
        });
        res.status(201).json(tag);
    } catch (err: unknown) {
        if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
            res.status(400).end('Tag already exists');
        } else {
            throw err;
        }
    }
}

export async function get_one(req: Request, res: Response) {
    const tag = await prisma.tag.findUnique(
        {
            where: {
                id: parseInt(req.params.tag_id)
            }
        }
    );
    if(tag){
        res.json(tag);
    } else {
        throw new NotFoundError('Tag not found');
    }
}

export async function get_all_of_book(req: Request, res: Response) {
    const bookId = parseInt(req.params.book_id);
    const tagsOfBook = await prisma.book.findUnique({
        where: {
            id: bookId
        },
        include: {
            tags: true
        }
    });
    if (tagsOfBook){
        res.json(tagsOfBook);
    } else {
        throw new NotFoundError('Book not found');
    }
}

export async function delete_one(req: Request, res: Response) {
    const tagId = parseInt(req.params.tag_id);
    const tag = await prisma.tag.delete({
        where: {
            id: tagId
        }
    });
    if(tag){
        res.json(tag);
    } else {
        throw new NotFoundError('Tag not found');
    }
}

export async function update_one(req: Request, res: Response) {
    assert(req.body.name, TagUpdateData);
    const tagId = parseInt(req.params.tag_id);
    const tag = await prisma.tag.update({
        where: {
            id: parseInt(req.params.tag_id)
        },
        data : {
            name: req.body.name
        }
    });
    if (tag){
        res.json(tag);
    } else {
        throw new NotFoundError('Tag not found');
    }
}

export async function add_one_to_book(req: Request, res: Response) {
    const bookId = parseInt(req.params.book_id);
    const tagId = parseInt(req.params.tag_id);
    const book = await prisma.book.update({
        where: {
            id: bookId
        },
        data: {
            tags: {
                connect: {
                    id: tagId
                }
            }
        }
    });
    if (book){
        res.json(book);
    } else {
        throw new NotFoundError('Book not found');
    }
}

export async function delete_one_from_book(req: Request, res: Response) {
    const bookId = parseInt(req.params.book_id);
    const tagId = parseInt(req.params.tag_id);
    const book = await prisma.book.update({
        where: {
            id: bookId
        },
        data: {
            tags: {
                disconnect: {
                    id: tagId
                }
            }
        }
    });
    if (book){
        res.json(book);
    } else {
        throw new NotFoundError('Book not found');
    }
}