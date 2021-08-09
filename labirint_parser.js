const Parser = require('./parser.js')

class LabirintParser extends Parser {
    constructor(url, search) {
        super(url, search);
    }
    
    static async setDataLabirintBooks(book) {
        const $ = await Parser.getHTML(book['src_and_price_books'][0]['source']);
    
        let ageLimit = $('#age_dopusk').text().slice(0, 2).replace('+', '');
        
        if (ageLimit)
            book['age_limit'] = ageLimit;
    
        book['ISBN'] = $('div.isbn').text().slice(0, 24);

        let yearRelease = $('div.publisher').text().slice(-7, 6).trim();

        if (yearRelease)
            book['year_release'] = yearRelease;
    
        return book;
    }

    async parse() {
        try {
            let max_pages = 1;

            for (const page of this.$('a.pagination-number__text')) {
                for (const children of page['children']) { 
                    let number = Number(children['data']);
                    if (number > max_pages) max_pages = number;
                }
            }
        
            let titles = [];
            let images = [];
            let bookSources = [];
            let publishingHouses = [];
            let authors = [];
            let prices = [];
            let statusList = [];
            let genres = [];
            let typesProducts = [];
        
            for (let i = 1; i <= max_pages; i++) {
                this.$ = await Parser.getHTML(encodeURI(`${this.url}}&page=${i}`));
        
                authors = authors.concat(await this.getDataFromChildElementAttribs('div.product-author', 'a', 'title'));
                publishingHouses = publishingHouses.concat(await this.getDataFromElementsAttribs('a.product-pubhouse__pubhouse', 'title'));
                titles = titles.concat(await this.getDataFromElements('span.product-title'));
                images = images.concat(await this.getDataFromChildElementAttribs('a.cover', 'img', 'data-src'));
                bookSources = bookSources.concat(await this.getDataFromElementsAttribs('a.cover', 'href'));
                prices = prices.concat(await this.getDataFromElementsAttribs('div.product', 'data-discount-price'));
                statusList = statusList.concat(await this.getDataFromElementsAttribs('div.product', 'data-available-status'));
                genres = genres.concat(await this.getDataFromElementsAttribs('div.product', 'data-first-genre-name'));
                typesProducts = typesProducts.concat(await this.getDataFromElementsAttribs('div.product', 'data-sgenre-name'));
            }
        
            let books = [];
        
            for (let i = 0; i < titles.length; i++) {
                if (statusList[i] != '1' || typesProducts[i] != 'книга') continue;
                books[i] = {
                    'title': titles[i],
                    'img': images[i],
                    'author': authors[i],
                    'publishing_house': publishingHouses[i],
                    'genre': genres[i],
                    'src_and_price_books': [
                        {
                            'site': 'Лабиринт',
                            'source': `https://www.labirint.ru${bookSources[i]}`,
                            'price': prices[i]
                        }
                    ],
                    'year_release': 'не указан', 
                    'ISBN': 'ISBN: не указан', 
                    'age_limit': 'не указано', 
                    'class_book': 'печатная', 
                    'type_book': 'текстовый',
                    'images': [images[i]],
                    'search_queries': [this.search]
                };
            }

            return await Promise.all(books.map(LabirintParser.setDataLabirintBooks));
        } catch(err) {
            return [];
        }
    }
}

module.exports = LabirintParser;