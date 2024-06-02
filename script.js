const searchBox = document.querySelector('#search-box');
const searchR = document.querySelector('#search-result');
const searchForm = document.querySelector('#search-form');
const loadingIndicator = document.querySelector('#loading');
const errorMessage = document.querySelector('#error-message');
let keyword = "";
let page = 1;
const accessKey = "BSwPrLuGlAHmPnFixFoXmzRlunVtUqEHpQyfaG26akM";
async function searchImages() {
    try {
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';
        const cachedResults = localStorage.getItem(`search-${keyword}-${page}`);
        let data;
        if (cachedResults) {
            data = JSON.parse(cachedResults);
        } else {
            const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${accessKey}&per_page=12`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            data = await response.json();
            localStorage.setItem(`search-${keyword}-${page}`, JSON.stringify(data));
        }
        if (data.results.length === 0) {
            throw new Error('No results found');
        }
        displayImages(data.results);
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

function displayImages(images) {
    const fragment = document.createDocumentFragment();
    images.forEach(image => {
        const imgElement = document.createElement('img');
        imgElement.src = image.urls.small;
        fragment.appendChild(imgElement);
    });
    searchR.appendChild(fragment);
}

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    keyword = searchBox.value.trim();
    if (keyword) {
        page = 1;
        searchR.innerHTML = '';
        searchImages();
    } else {
        errorMessage.textContent = 'Please enter a search term';
        errorMessage.style.display = 'block';
    }
});

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

searchBox.addEventListener('input', debounce(() => {
    keyword = searchBox.value.trim();
    if (keyword) {
        page = 1;
        searchR.innerHTML = '';
        searchImages();
    } else {
        searchR.innerHTML = '';
        errorMessage.textContent = 'Please enter a search term';
        errorMessage.style.display = 'block';
    }
}, 500));

window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        page++;
        searchImages();
    }
});
