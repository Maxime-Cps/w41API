import {object, string, size, number} from 'superstruct';

export const TagCreationData = object({
    name: size(string(), 1, 50),
});

export const TagUpdateData = object({
    id: number(),
    name: size(string(), 1, 50),
});