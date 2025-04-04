import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Create Tags
    const tagFantasy = await prisma.tag.upsert({
        where: { name: "Fantasy" },
        update: {},
        create: { name: "Fantasy" }
    });

    const tagAdventure = await prisma.tag.upsert({
        where: { name: "Adventure Story" },
        update: {},
        create: { name: "Adventure Story" }
    });

    const tagSciFi = await prisma.tag.upsert({
        where: { name: "Science Fiction" },
        update: {},
        create: { name: "Science Fiction" }
    });

    const tagDistopy = await prisma.tag.upsert({
        where: { name: "Dystopian" },
        update: {},
        create: { name: "Dystopian" }
    });

    const tagPhilosophy = await prisma.tag.upsert({
        where: { name: "Philosophy" },
        update: {},
        create: { name: "Philosophy" }
    });

    const tagHorror = await prisma.tag.upsert({
        where: { name: "Horror" },
        update: {},
        create: { name: "Horror" }
    });

    // 2. Create Authors
    const authorTolkien = await prisma.author.create({
        data: {
            firstname: "J. R. R.",
            lastname: "Tolkien"
        }
    });

    const authorLovecraft = await prisma.author.create({
        data: {
            firstname: "H. P.",
            lastname: "Lovecraft"
        }
    });

    const authorCamus = await prisma.author.create({
        data: {
            firstname: "Albert",
            lastname: "Camus"
        }
    });

    const authorHerbert = await prisma.author.create({
        data: {
            firstname: "Frank",
            lastname: "Herbert"
        }
    });

    const authorBradbury = await prisma.author.create({
        data: {
            firstname: "Ray",
            lastname: "Bradbury"
        }
    });

    const authorBarjavel = await prisma.author.create({
        data: {
            firstname: "René",
            lastname: "Barjavel"
        }
    });

    // 3. Create Books
    const lotrBook = await prisma.book.create({
        data: {
            titlename: "Lord of the Rings",
            publication_year: 1954,
            author: { connect: { id: authorTolkien.id } },
            tags: {
                connect: [{ id: tagFantasy.id }, { id: tagAdventure.id }]
            }
        }
    });

    const hobBook = await prisma.book.create({
        data: {
            titlename: "The Hobbit",
            publication_year: 1937,
            author: { connect: { id: authorTolkien.id } },
            tags: {
                connect: [{ id: tagFantasy.id }, { id: tagAdventure.id }]
            }
        }
    });

    const etrBook = await prisma.book.create({
        data: {
            titlename: "L'Etranger",
            publication_year: 1942,
            author: { connect: { id: authorCamus.id } },
            tags: {
                connect: [{ id: tagPhilosophy.id }]
            }
        }
    });

    const duneBook = await prisma.book.create({
        data: {
            titlename: "Dune",
            publication_year: 1965,
            author: { connect: { id: authorHerbert.id } },
            tags: {
                connect: [{ id: tagSciFi.id }, { id: tagDistopy.id }, { id: tagAdventure.id }]
            }
        }
    });

    const f451Book = await prisma.book.create({
        data: {
            titlename: "Fahrenheit 451",
            publication_year: 1953,
            author: { connect: { id: authorBradbury.id } },
            tags: {
                connect: [{ id: tagSciFi.id }, { id: tagDistopy.id }]
            }
        }
    });

    const ndtBook = await prisma.book.create({
        data: {
            titlename: "La Nuit des temps",
            publication_year: 1958,
            author: { connect: { id: authorBarjavel.id } },
            tags: {
                connect: [{ id: tagSciFi.id }, { id: tagDistopy.id }]
            }
        }
    });

    const cvaBook = await prisma.book.create({
        data: {
            titlename: "The Colour Out of Space",
            publication_year: 1927,
            author: { connect: { id: authorLovecraft.id } },
            tags: {
                connect: [{ id: tagHorror.id }, { id: tagSciFi.id }]
            }
        }
    });

    // 4. Create Users
    const users = [
        {
            username: "Critique1",
            email: "example@example.com",
            password: "$2a$12$RB2JiaPZUXJ8ZHxt6GXUxe1qqviGD0jJjGccpJPvy/GDoAW2MIgLq"
        },
        {
            username: "Critique2",
            email: "example2@example2.com",
            password: "$2a$12$D7MtB7auJ9o1uFYpHiEUJOlRfV7.jPtFDCrwtFMsVSnC1lya7UwMC"
        }
    ];

    for (const user of users) {
        const existingUser = await prisma.user.findUnique({
            where: { username: user.username }
        });
        if (!existingUser) {
            await prisma.user.create({
                data: user
            });
        }
    }

    // 5. Create Ratings
    await prisma.rating.create({
        data: {
            value: 19,
            book: { connect: { id: lotrBook.id } },
            creator: { connect: { username: "Critique1" } }
        }
    });

    await prisma.rating.create({
        data: {
            value: 18,
            book: { connect: { id: lotrBook.id } },
            creator: { connect: { username: "Critique2" } }
        }
    });

    // 6. Create Comments
    await prisma.comment.create({
        data: {
            content: "Very good, very nice",
            book: { connect: { id: lotrBook.id } },
            creator: { connect: { username: "Critique1" } }
        }
    });

    await prisma.comment.create({
        data: {
            content: "Tiny little humans with a ring",
            book: { connect: { id: hobBook.id } },
            creator: { connect: { username: "Critique2" } }
        }
    });

    console.log("Database seeded successfully!");
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