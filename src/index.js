import PixabayApiService from "./fetchpictures";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
let lightbox = new SimpleLightbox('.gallery a');

const refs = {
    searchForm: document.querySelector('.search-form'),
    galleryContainer: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more'),
}

const pixabayApiService = new PixabayApiService();

refs.searchForm.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(event) {
    event.preventDefault();
    refs.galleryContainer.innerHTML = '';
    setLoadMoreBtn('loading');

    pixabayApiService.query = event.target.elements.searchQuery.value;
    pixabayApiService.resetPage();

    try {
        const { hits, totalHits } = await pixabayApiService.fetchPictures();
        
        if (!totalHits) {
            Notify.failure("Sorry, there are no images matching your search query.Please try again.");
        } else {
            Notify.success(`Hooray! We found ${totalHits} images.`);
            await renderGallery(hits);

            scroll();
            onGalleryLightbox();
        } 
        
        if (totalHits <= 40) setLoadMoreBtn('hidden');
        else setLoadMoreBtn('active');
    } catch (error) {
        console.log(error);
    }
}

async function onLoadMore() {
    setLoadMoreBtn('loading');

    try {
        const { hits, totalHits } = await pixabayApiService.fetchPictures();
        await renderGallery(hits);

        if ((pixabayApiService.page - 1) * 40 >= totalHits) {
            Notify.info("We're sorry, but you've reached the end of search results.");
            setLoadMoreBtn('hidden');
        } else setLoadMoreBtn('active');

        scroll();    
        onGalleryLightbox();
    } catch (error) {
        console.log(error);
    }
}

async function renderGallery(pictures) {
    const markup = await pictures
        .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
            return `
            <a href="${largeImageURL}" class="photo-card">
              <img src="${webformatURL}" alt="${tags}" loading="lazy" />
              <div class="info">
                <p class="info-item"><b>Likes</b>${likes}</p>
                <p class="info-item"><b>Views</b>${views}</p>
                <p class="info-item"><b>Comments</b>${comments}</p>
                <p class="info-item"><b>Downloads</b>${downloads}</p>
              </div>
            </a>
            `;})
        .join('');

    refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
}

function onGalleryLightbox() {
    lightbox.refresh();
    lightbox.on('show.simplelightbox');
}

function setLoadMoreBtn(options) {
    switch (options) {
        case 'loading':
            refs.loadMoreBtn.classList.add('is-shown');
            refs.loadMoreBtn.disabled = true;
            refs.loadMoreBtn.textContent = 'Loading...';
            break;
        case 'active':
            refs.loadMoreBtn.classList.add('is-shown');
            refs.loadMoreBtn.disabled = false;
            refs.loadMoreBtn.textContent = 'Load more';
            break;
        case 'hidden':
            refs.loadMoreBtn.classList.remove('is-shown');
            break;
    }
}

function scroll() {
    const { height: cardHeight } = refs.galleryContainer
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
}