import { PrismaClient } from '@prisma/client';
import { connect } from 'http2';

const prisma = new PrismaClient();

async function main() {
    // 1. Create Tags
    const tagFantasy = await prisma.tag.upsert({ // upsert to avoid duplication
        where: { name: "Fantasy" },
        update: {},
        create: { name: "Fantasy" }
    });

    const tagAdventure = await prisma.tag.upsert({
        where: { name: "Adventure Story" },
        update: {},
        create: { name: "Adventure Story" }
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

    // 3. Create Books
    const lotrBook = await prisma.book.create({
        data: {
            titlename: "Le Seigneur des Anneaux",
            publication_year: 1954,
            author: { connect: { id: authorTolkien.id } },
            tags: {
                connect: [{ id: tagFantasy.id }, { id: tagAdventure.id }]
            }
        }
    });

    const hobBook = await prisma.book.create({
        data: {
            titlename: "Le Hobbit",
            publication_year: 1937,
            author: { connect: { id: authorTolkien.id } },
            tags: {
                connect: [{ id: tagFantasy.id }, { id: tagAdventure.id }]
            }
        }
    });

    // 4. Create Users
    const critic1 = await prisma.user.create({
        data: {
            username: "Critique1",
            email: "example@example.com",
            password: "$2a$12$RB2JiaPZUXJ8ZHxt6GXUxe1qqviGD0jJjGccpJPvy/GDoAW2MIgLq" // examplePassword
        }
    });
    const critic2 = await prisma.user.create({
        data: {
            username: "Critique2",
            email: "example2@example2.com",
            password: "$2a$12$D7MtB7auJ9o1uFYpHiEUJOlRfV7.jPtFDCrwtFMsVSnC1lya7UwMC" // examplePassword
        }
    });

    // 5. Create Ratings
    await prisma.rating.create({
        data: {
            value: 19,
            book: { connect: {id: lotrBook.id} },
            creator: { connect: {id: critic1.id} }
        }
    });

    await prisma.rating.create({
        data: {
            value: 18,
            book: { connect: {id: lotrBook.id} },
            creator: { connect: {id: critic2.id} }
        }
    });

    // 6. Create Comments
    await prisma.comment.create({
        data: {
            content: "Very good, very nice",
            book: { connect: {id: lotrBook.id} },
            creator: { connect: {id: critic1.id} }
        }
    });

    await prisma.comment.create({
        data: {
            content: "Tiny little humans with a ring",
            book: { connect: {id: hobBook.id} },
            creator: { connect: {id: critic2.id} }
        }
    })

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
