const cheerio = require('cheerio');
const axios = require('axios');

class Parser {
    constructor(url, search) {
        this.url = url;
        this.search = search;
    }

    async setHTMLContent() {
        this.$ = await Parser.getHTML(encodeURI(this.url));
    }

    static async getHTML(url) {
        try {
            const { data } = await axios.get(url);
            return cheerio.load(data);
        } catch (err) {
            return null;
        }
    }

    async getDataFromElements(element) {
        let data = [];
        
        this.$(element).each((i, el) => {
            data.push(this.$(el).text());
        });

        return data;
    }

    async getDataFromElementsAttribs(element, attribute) {
        let data = [];

        this.$(element).each((i, el) => {
            data.push(this.$(el).attr(attribute));
        });
    
        return data;
    }

    async getDataFromChildElements(element, childElement) {
        let data = [];
        
        this.$(element).each((i, el) => {
            data.push(this.$(el).find(childElement).text());
        });

        return data;
    }

    async getDataFromChildElementAttribs(element, childElement, attribute) {
        let data = [];
        
        this.$(element).each((i, el) => {
            data.push(this.$(el).find(childElement).attr(attribute));
        });

        return data;
    }
}

module.exports = Parser;