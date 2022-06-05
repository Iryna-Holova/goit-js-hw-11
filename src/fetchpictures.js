import axios from "axios";

const URL = 'https://pixabay.com/api/';
const API_KEY = '27839370-99dd6ddd44ecd058cc6f2562b';
axios.defaults.baseURL = URL;

export default class PixabayApiService {
    constructor() {
        this.searchQuery = '';
        this.page = 1;
     }

    async fetchPictures() {
        axios.defaults.params = {
            key: API_KEY,
            q: this.searchQuery,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: true,
            per_page: 40,
            page: this.page,
        };
        
        const {data} = await axios.get();
        this.incrementPage();
        return data;
    }

    incrementPage() {
        this.page += 1;
    }

    resetPage() {
        this.page = 1;
    }

    get query() {
        return this.searchQuery;
    }

    set query(newQuery) {
        this.searchQuery = newQuery;
    }
}