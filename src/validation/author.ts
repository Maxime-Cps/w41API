import {object, string, size, number, optional, enums} from 'superstruct';

export const AuthorCreationData = object({
    firstname: size(string(), 1, 50),
    lastname: size(string(), 1, 50),
});

export const AuthorUpdateData = object({
    id: number(),
    firstname: size(string(), 1, 50),
    lastname: size(string(), 1, 50),
});

export const AuthorQueryParams = object({
    lastnameInput: optional(string()),
    hasBooks: optional(enums(['true', 'false'])),
    include: optional(enums(['books'])),
    skip: optional(string()),
    take: optional(string())
});

