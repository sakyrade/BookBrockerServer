const express = require('express');
const LabirintParser = require('./labirint_parser.js');
const BookvoedParser = require('./bookvoed_parser.js');
const DatabaseRepository = require('./mongo_database.js');

const server = express();
const databaseRepository = new DatabaseRepository("mongodb+srv://BookBrockerUser:8Tw5caq26uMeiiVt@bookbrockerdb.zomxq.mongodb.net/SearchBooksAppDB?retryWrites=true&w=majority");

const booksFilter = (books) => {
    for (let i = 0; i < books.length; i++) {
        for (let j = 0; j < books.length; j++) {
            if (i == j) continue;
            if (books[i]['publishing_house'] == 'не указано' || books[i]['publishing_house'] == 'не указано') continue;
            if (books[i]['src_and_price_books'][0]['site'] == books[j]['src_and_price_books'][0]['site']) continue;
            if (books[i]['title'] == books[j]['title'] && books[i]['publishing_house'] == books[j]['publishing_house'] && 
                books[i]['ISBN'] == books[j]['ISBN']) {
                if (books[j] != 'не указан') {
                    books[j]['src_and_price_books'] = books[j]['src_and_price_books'].concat(books[i]['src_and_price_books']);
                    books.splice(i, 1)
                    continue;
                }
                books[i]['src_and_price_books'] = books[o]['src_and_price_books'].concat(books[j]['src_and_price_books']);
                books.splice(j, 1);
            }
        }
    }

    return books;
};

const updateBooks = async (search, books) => {
    for (let i = 0; i < books.length; i++) {
        let book = await databaseRepository.findOne('books', { $and: [{ "img": books[i]['img'] }, { "title": books[i]['title'] }, { "author": books[i]['author'] }, { "publishing_house": books[i]['publishing_house'] }]});

        if (!book) { 
            await databaseRepository.insertOne('books', books[i]);
            continue;
        }
        
        if (!book['search_queries'].includes(search)) books[i]['search_queries'] = books[i]['search_queries'].concat(book['search_queries']);

        await databaseRepository.updateOne('books', book, { $set: books[i] });
    }
};

const parse = async (search) => {
    const labParser = new LabirintParser(`https://www.labirint.ru/search/${search}/?stype=0`, search);
    const bookvoedParser = new BookvoedParser(`https://www.bookvoed.ru/books?q=${search}`, search);
    await labParser.setHTMLContent();
    await bookvoedParser.setHTMLContent();
    
    let books = await labParser.parse();
    books = books.concat(await bookvoedParser.parse());

    if (books.length) {
        books = booksFilter(books);
        await databaseRepository.openConnection('SearchBooksAppDB');
        await updateBooks(search, books);
        databaseRepository.closeConnection();
    }

    return { 'books': books };
};

server.get('/search_books', async (req, res) => {
    res.send(await parse(req.query.search));
});

server.listen(5000);