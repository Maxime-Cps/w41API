import express, { Request, Response, NextFunction } from 'express';
import {HttpError} from "./error";
import * as author from './requestHandlers/author';
import * as book from './requestHandlers/book';
import * as tag from './requestHandlers/tag';
import * as user from './requestHandlers/user';
import * as comment from './requestHandlers/comment';
import * as rating from './requestHandlers/rating';
import {assert, StructError} from 'superstruct';

import { object, optional, refine, string } from 'superstruct';
import { isInt } from 'validator';
import cors from 'cors';

const app = express();
const port = 3000;


app.use(cors()); // premier middleware

// Utilisation du middleware express.json pour récupérer les requêtes en JSON
// à déclarer avant les routes
app.use(express.json());


// Middleware pour ajouter les headers nécessaires pour CORS
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Expose-Headers', 'X-Total-Count');
    next();
});

/*------------------------
==========================
Validation des paramètres
==========================
 ------------------------*/

export const ReqParams = object({
    author_id: optional(refine(string(), 'int', (value) => isInt(value))),
    book_id: optional(refine(string(), 'int', (value) => isInt(value))),
    tag_id: optional(refine(string(), 'int', (value) => isInt(value))),
});

const validateParams = (req: Request, res: Response, next: NextFunction) => {
    assert(req.params, ReqParams);
    next();
};

/*------------------------
==========================
         Routes
==========================
-------------------------*/

/*------------------------
    Routes pour author
------------------------*/
app.route('/authors')
    .get(author.get_all)
    .post(author.create_one)

app.route('/authors/:author_id')
    .all(validateParams)
    .get(author.get_one)
    .patch(author.update_one)
    .delete(author.delete_one);

/*------------------------
    Routes pour book
------------------------*/
app.route('/books')
    .get(book.get_all)

app.route('/books/:book_id')
    .all(validateParams)
    .get(book.get_one)
    .patch(book.update_one)
    .delete(book.delete_one)

app.route('/authors/:author_id/books')
    .all(validateParams)
    .get(book.get_all_of_author)
    .post(book.create_one);

/*------------------------
     Routes pour tag
------------------------*/
app.route('/tags')
    .get(tag.get_all)
    .post(tag.create_one)

app.route('/tags/:tag_id')
    .all(validateParams)
    .get(tag.get_one)
    .patch(tag.update_one)
    .delete(tag.delete_one)

app.route('/books/:book_id/tags')
    .all(validateParams)
    .get(tag.get_all_of_book)

app.route('/books/:book_id/tags/:tag_id')
    .all(validateParams)
    .post(tag.add_one_to_book)
    .delete(tag.delete_one_from_book)

/*------------------------
     Routes pour User
------------------------*/

app.route('/signup')
    .post(user.create_one)

app.route('/signin')
    .post(user.connect)

app.route('/books/:book_id/comments')
    .all(validateParams)
    .get(comment.get_all_comments_of_book)
    .post(comment.create_comment)

app.route('/comments/:comment_id')
    .all(validateParams)
    .patch(comment.update_comment)
    .delete(comment.delete_comment)

app.route('/books/:book_id/ratings')
    .all(validateParams)
    .get(rating.get_all_ratings_of_book)
    .post(rating.create_rating)

app.route('/ratings/:rating_id')
    .all(validateParams)
    .patch(rating.update_rating)
    .delete(rating.delete_rating)

app.route('/books/:book_id/ratings/average')
    .all(validateParams)
    .get(rating.get_average_rating_of_book)


/*------------------------
==========================
    Gestion des erreurs
==========================
-------------------------*/
app.get('/', (req: Request, res: Response) => {
    throw res.status(200).end('Welcome on the API');
});


app.use((err: HttpError | StructError, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }
    if (err instanceof StructError) {
        err.status = 400;
        err.message = `Bad value for field ${err.key}`;
    } else {
        err.status = 500;
        err.message = 'Internal server error';
    }
    res.status(err.status).send(err.message);
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});



