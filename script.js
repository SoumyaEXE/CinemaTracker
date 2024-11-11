const btnSearch = document.querySelector(".btn-search")
const movieContainerEl = document.querySelector('.container-movie')
const checkLocalStorage = JSON.parse(localStorage.getItem("localWatchlistArray"))
let movieArray = []
let watchlistArray = []
let totalMoviePages = ""

if (checkLocalStorage) {
    watchlistArray = checkLocalStorage
}

// Movie Page
if (getCurruntPage() === "movie") {
    document.querySelector('.my-watchlist').addEventListener('click', () => {
        window.location.href = "watchlist.html"
    })

    btnSearch.addEventListener('click', () => {
        movieArray = []
        const searchText = document.querySelector('.search-text').value.trimEnd()
        if (searchText == "") {
            setEmptyContainer("emptySearch")
        }
        else {
            getMovieId(searchText, 1)
        }
    })

    document.addEventListener('click', (e) => {
        if (e.target.dataset.imdb) {
            const tagetElementId = e.target.id
            document.getElementById(tagetElementId)
            {
                document.getElementById(`${tagetElementId}`).classList.remove('fa-circle-plus')
                document.getElementById(`${tagetElementId}`).classList.add('fa-circle-check')
            }
            updateWatchlistArray(e.target.dataset.imdb)
        }
        else if (e.target.dataset.page) {
            movieArray = []
            const searchText = document.querySelector('.search-text').value.trimEnd()
            getMovieId(searchText, parseInt(e.target.id))
        }
    })

    function updateWatchlistArray(movieId) {
        const checkArray = watchlistArray.find(item => item.imdbID === movieId)
        if (checkArray) {
            window.alert("Already in Watchlist")
        }
        else {
            let watchlistObj = movieArray.filter(item => item.imdbID === movieId)[0]
            watchlistArray.push(watchlistObj)
            updateLocalStorage()
        }
    }
    function getMovieId(searchText, pageNo) {
        loadaing()
        fetch(`https://www.omdbapi.com/?apikey=367e161c&s=${searchText}&page=${pageNo}`)
            .then(res => res.json())
            .then(data => {
                totalMoviePages = Math.ceil(data.totalResults / 10)
                if (data.Response === "True") {
                    const moviesIdArray = data.Search.map(item => item.imdbID)
                    fetchMovies(moviesIdArray)
                }
                else {
                    setEmptyContainer("movieContainer")
                }
            })
    }

    async function fetchMovies(data) {
        for (let item of data) {
            item = item.replace('"', '')
            await fetch(`https://www.omdbapi.com/?apikey=367e161c&i=${item}`)
                .then(res => res.json())
                .then(data => movieArray.push(data))
        }
        render(movieArray)
        genratePageNumber(totalMoviePages)
    }
}

// Watchlist Page
if (getCurruntPage() === "watchlist") {
    document.querySelector(".container-movie").style.padding = "20px 20px"
    document.querySelector('.go-to-search').addEventListener('click', () => {
        window.location.href = "index.html"
    })

    render(watchlistArray)
    if (watchlistArray.length === 0) {
        setEmptyContainer("watchlistContainer")
    }

    document.addEventListener("click", (e) => {
        if (e.target.dataset.imdb) {
            removeArrayObject(e.target.dataset.imdb)
            render(watchlistArray)
        }
        if (watchlistArray.length === 0) {
            setEmptyContainer("watchlistContainer")
        }

    })
}

// Utils
function loadaing() {
    movieContainerEl.innerHTML = `
            <div class="logo-container">
                      <img src="assert/load.svg" class="loading">
            </div>
          `
}

function getCurruntPage() {
    return document.body.classList.contains('page-movie') ? "movie" : "watchlist"
}

function genratePageNumber(numOfPages) {
    let pageNumHtml = Array(numOfPages).fill(0).map((item, index) => item = index + 1)
    pageNumHtml = pageNumHtml.map(item => item =
        `<span id="${item}" data-page=${item} class="number">${item}</span>`).join("")

    movieContainerEl.innerHTML +=
        `<div class="page-number">
                            ${pageNumHtml}
                        </div>`
}

function checkExistingElement(item) {
    return checkLocalStorage.filter(oldItem => oldItem.imdbID === item).length > 0 ? true : false
}

function removeArrayObject(itemId) {
    watchlistArray = watchlistArray.filter(item => item.imdbID != itemId)
    updateLocalStorage()
}

function updateLocalStorage() {
    localStorage.setItem("localWatchlistArray", JSON.stringify(watchlistArray))
}

function setEmptyContainer(message) {
    if (message === "watchlistContainer") {
        movieContainerEl.innerHTML = `
                <div class="logo-container">
                        <p>Your Watchlist is litte empty </p>     
                        <p class="font-dark"> 
                            <a href="index.html">
                                <i class="fa-solid fa-circle-plus"></i> 
                            </a>
                            Let's add some movies
                        </p>   
                    </div> 
            `
    }
    else if (message === "movieContainer") {
        movieContainerEl.innerHTML = `
                             <div class="logo-container">
                                <p>
                                    Movie Not Found Please Try another Search
                                </p>
                            </div> 
                        `
    }
    else if (message === "emptySearch") {
        movieContainerEl.innerHTML = `
            <div class="logo-container">
                <p>
                      Try Putting some text into search box and search again
                </p>
            </div>`
    }

}

function render(data) {
    let html = ""
    let icon = `fa-circle-plus`

    data.forEach(item => {
        if (checkLocalStorage && getCurruntPage() == "movie") {
            icon = checkExistingElement(item.imdbID) ? `fa-circle-check` : `fa-circle-plus`
        }
        else if(getCurruntPage()=="watchlist"){
            icon = "fa-circle-minus"
        }

        html += `
                <div class="movie-card">
                    <div class="movie-image" style="background-image:url('${item.Poster}')"></div>
                    <div class="movie-details">
                        <h2 class="movie-name"> ${item.Title}
                        <span class="movie-rating">⭐${item.imdbRating}</span>
                        </h2>
                        <p class="movie-info">
                            <span class="movie-duration">${item.Runtime}</span>
                            <span class="movie-genres">${item.Genre}</span>
                            <span class="watchlist" >
                                <i class="fa-solid ${icon}" data-imdb="${item.imdbID}" id=${item.imdbID}></i> watchlist
                            </span>
                        </p>
                        <p class="movie-descreption">
                           ${item.Plot}
                        </p>
                    </div>
                </div> 
        `
    })
    movieContainerEl.innerHTML = html
}

