import {object, string, size, number, optional, enums, nullable} from 'superstruct';

export const BookCreationData = object({
    titlename: size(string(), 1, 50),
    publication_year: number(),
});

export const BookUpdateData = object({
    titlename: size(string(), 1, 50),
    publication_year: nullable(number()),
});

export const AuthorBooksQueryParams = object({
    titlenameInput: optional(size(string(), 1, 50)),
    skip: optional(string()),
    take: optional(string())
});

export const BooksQueryParams = object({
    titlenameInput: optional(size(string(), 0, 50)),
    include: optional(enums(['author'])),
    skip: optional(string()),
    take: optional(string())
});