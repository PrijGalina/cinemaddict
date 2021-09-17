import AbstractView from './abstract';

const createNoMovieTemplate = () => {
  const activeFilter = document.querySelector('.main-navigation__item--active');
  let message = '';
  switch (activeFilter.textContent) {
    case 'All movies':
      message = 'There are no movies in our database';
      break;
    case 'Watchlist':
      message = 'There are no movies to watch now';
      break;
    case 'History':
      message = 'There are no watched movies now';
      break;
    case 'Favorites':
      message = 'There are no favorite movies now';
      break;

  }
  return (`<section class="films-list"><h2 class="films-list__title">${message}</h2></section>`);
};

export default class NoMovie extends AbstractView {

  getTemplate() {
    return createNoMovieTemplate();
  }
}
