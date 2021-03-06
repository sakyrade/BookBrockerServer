const Parser = require('./parser.js')

class BookvoedParser extends Parser {
    constructor(url, search) {
        super(url, search);
    }

    static async setDataBookvoedBooks(book) {
        const $ = await Parser.getHTML(book['src_and_price_books'][0]['source']);

        let bookData = [];

        $('.Vz').each((i, el) => {
            let data = { };
            data[$(el).children('.Wz').text()] = $(el).children('.Xz').text();
            bookData.push(data);
        });

        for (const d of bookData) {
            if (d['Издательство:']) book['publishing_house'] = d['Издательство:'];
            if (d['Год:']) book['year_release'] = d['Год:'];
            if (d['ISBN:']) book['ISBN'] = `ISBN: ${d['ISBN:']}`;
            if (d['Тематика:']) book['genre'] = d['Тематика:'];
        }

        $('.rh').each((i, el) => {
            book['images'].push(`https://www.bookvoed.ru${$(el).attr('data-image-href')}`);
        });

        return book;
    }

    async parse() {
        try {
            let titles = (await this.getDataFromElements('a.yLb')).map(str => { return str.trim(); });
            let images = await this.getDataFromElementsAttribs('img.Kr', 'src');
            let bookSources = await this.getDataFromElementsAttribs('a.Ir', 'href');
            let authors = (await this.getDataFromElements('div.Pr')).map(str => { return str.trim(); });
            let prices = (await this.getDataFromChildElements('div.wg', '.xg')).map(str => {
                if (str != '')
                    return str.replace(' ₽', '').replace(' ', '').trim();
                return undefined;
            });
            let typesProducts = await this.getDataFromElementsAttribs('div.Lh', 'data-item-type');

            let books = [];
        
            for (let i = 0; i < titles.length; i++) {
                if (typesProducts[i] != 'book' || prices[i] === undefined) continue;
                books[i] = {
                    'title': titles[i],
                    'img': `https://www.bookvoed.ru${images[i]}`,
                    'author': authors[i],
                    'publishing_house': 'не указано',
                    'genre': 'не указан',
                    'src_and_price_books': [
                        {
                            'site': 'Буквоед',
                            'source': bookSources[i],
                            'price': prices[i]
                        }
                    ],
                    'year_release': 'не указан', 
                    'ISBN': 'ISBN: не указан', 
                    'age_limit': 'не указано', 
                    'class_book': 'печатная', 
                    'type_book': 'текстовый',
                    'images': [`https://www.bookvoed.ru${images[i]}`],
                    'search_queries': [this.search]
                };
            }

            return await Promise.all(books.map(BookvoedParser.setDataBookvoedBooks));
        } catch(err) {
            return [];
        }
    }
}

module.exports = BookvoedParser;