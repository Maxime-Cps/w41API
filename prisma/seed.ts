import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ajout de deux auteurs dans la BDD
async function main() {

    const tags = [
        { name: 'Fantasy' },
        { name: 'Horror' },
        { name: 'Adventure' }
    ];

    for (const tag of tags) {
        await prisma.tag.create({
            data: tag
        });
    }

    // Create authors and their books with associated tags
    const authors = [
        {
            firstname: 'J. R. R.',
            lastname: 'Tolkien',
            Book: {
                create: [
                    {
                        titlename: 'The Lord of the Rings',
                        publication_year: 1954,
                        tags: {
                            connect: [{ name: 'Fantasy' }, { name: 'Adventure' }]
                        }
                    },
                    {
                        titlename: 'The Hobbit',
                        publication_year: 1937,
                        tags: {
                            connect: [{ name: 'Fantasy' }]
                        }
                    }
                ]
            }
        },
        {
            firstname: 'H. P.',
            lastname: 'Lovecraft',
            Book: {
                create: [
                    {
                        titlename: 'The Call of Cthulhu',
                        publication_year: 1928,
                        tags: {
                            connect: [{ name: 'Horror' }]
                        }
                    }
                ]
            }
        }
    ];

    for (const author of authors) {
        await prisma.author.create({
            data: author
        });
    }

    const books = [
        {
            titlename: 'The Lord of the Rings',
            authorId: 1,
            publication_year: 1954,
        },
        {
            titlename: 'The Hobbit',
            authorId: 1,
            publication_year: 1937
        },
        {
            titlename: 'The Call of Cthulhu',
            authorId: 2,
            publication_year: 1928
        }
    ];

    for (const book of books) {
        await prisma.book.create({
            data: book,
            include: {
                author: true
            }
        });
    }

    const users = [
        {
            email: 'johndoe@gg.com',
            username: 'JDoe',
            password: '$2a$12$7kvadU7EZLhM6vj490bxluYwCY18yj1.vryt2RxNHApS4qIodigSi',
            comments: {
                create: [
                    {
                        content: 'very good book',
                        book: {
                            connect: {id: 1}
                        }
                    },
                    {
                        content: 'dogshit',
                        book: {
                            connect: {id: 2}
                        }
                    }
                ]
            },
            ratings: {
                create: [
                    {
                        value: 5,
                        book: {
                            connect: {id: 1}
                        }
                    },
                    {
                        value: 1,
                        book: {
                            connect: {id: 2}
                        }
                    }
                ]
            }
        },
        {
            email: 'jackdaniels@gg.com',
            username: 'Jdan',
            password: '$2a$12$WWZZAtg9V/Wum18lyYqXR./H.lZ3l2auiLeXICAwU5Tml8g4p37D.',
            comments: {
                create: [
                    {
                        content: 'ok',
                        book: {
                            connect: {id: 1}
                        }
                    },
                    {
                        content: 'loved it',
                        book: {
                            connect: {id: 2}
                        }
                    }
                ]
            },
            ratings: {
                create: [
                    {
                        value: 2,
                        book: {
                            connect: {id: 1}
                        }
                    },
                    {
                        value: 4,
                        book: {
                            connect: {id: 2}
                        }
                    }
                ]
            }
        },
    ]

    for (const user of users) {
        await prisma.user.create({
            data: user,
        });
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

