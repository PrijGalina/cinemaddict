import CommentPresenter from './comment';
import NewCommentPresenter from './new-comment';
import MoviePopupView from '../view/movie-popup';
import MovieCardView from '../view/movie-card';
import {render, remove, replace} from '../utils/render';
import {RenderPosition, Mode, UserAction, UpdateType} from './../const';
import { api } from '../api/api';
import CommentsModel from '../model/comments';

const commentsModel = new CommentsModel();

export default class Movie {
  constructor(container, moviesModel, changeData, changeMode) {
    this._container = container;
    this._moviesModel = moviesModel;
    this._commentsModel = commentsModel;
    this._changeData = changeData;
    this._changeMode = changeMode;

    this._movieComponent = null;
    this._popupComponent = null;
    this._collectionCommentsPresenter = new Map();
    this._NewCommentPresenter = null;
    this._comments = null;
    this._mode = Mode.DEFAULT;
    this._overlay = document.querySelector('.overlay');
    this._body = document.querySelector('body');

    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleOpenPopupClick = this._handleOpenPopupClick.bind(this);
    this._handleClosePopupClick = this._handleClosePopupClick.bind(this);
    this._handleEscKeydown = this._handleEscKeydown.bind(this);
    this._handleWatchlistClick = this._handleWatchlistClick.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);
    this._handleHistoryClick = this._handleHistoryClick.bind(this);

    this._handleCommentViewAction = this._handleCommentViewAction.bind(this);
  }

  init(movie) {
    this._movie = movie;
    const prevMovieComponent = this._movieComponent;
    this._containerForMovie = this._container
      .getElement()
      .querySelector('.films-list__container');

    this._movieComponent = new MovieCardView(this._movie);
    this._movieComponent.setOpenClickHandler(this._handleOpenPopupClick);
    this._movieComponent.setFavoriteClickHandler(this._handleFavoriteClick);
    this._movieComponent.setWatchlistClickHandler(this._handleWatchlistClick);
    this._movieComponent.setHistoryClickHandler(this._handleHistoryClick);

    if (prevMovieComponent === null) {
      render(
        this._containerForMovie,
        this._movieComponent,
        RenderPosition.BEFOREEND,
      );
      return;
    }
    replace(this._movieComponent, prevMovieComponent);

    remove(prevMovieComponent);
  }

  _getAndRenderComments() {
    api
      .getComments(this._movie)
      .then((comments) => {
        this._commentsModel.setComments(UpdateType.INIT, comments);
      })
      .then(() => {
        this._renderComments();
      })
      .catch(() => {
        this._commentsModel.setComments(UpdateType.INIT, []);
      });
  }

  _getComments() {
    return this._commentsModel.getComments();
  }

  destroy() {
    (this._popupComponent) ? remove(this._popupComponent) : '';
    remove(this._movieComponent);
  }

  destroyCommenstBlock() {
    if (this._collectionCommentsPresenter) {
      this._collectionCommentsPresenter.forEach((presenter) =>
        presenter.destroy(),
      );
    }
    if (this._NewCommentPresenter) {
      this._NewCommentPresenter.destroy();
    }
  }

  resetView() {
    if (this._mode !== Mode.DEFAULT) {
      this._replacePopupToCard();
    }
  }

  setViewState() {}

  _replacePopupToCard() {
    remove(this._popupComponent);
    this._mode = Mode.DEFAULT;
    this._body.classList.remove('hidden-scroll');
    this._overlay.classList.remove('active');
    document.removeEventListener('keydown', this._handleEscKeydown);
    this._overlay.removeEventListener('click', this._handleClosePopupClick);
  }

  _replaceCardToPopup() {
    const siteMainElement = document.querySelector('.main');
    render(siteMainElement, this._popupComponent, RenderPosition.BEFOREEND);
    this._changeMode();
    this._mode = Mode.CHANGED;
  }

  _renderComments() {
    this.destroyCommenstBlock();
    this._comment = this._getComments();
    this._containerCommentsListInPopup = this._popupComponent
      .getElement()
      .querySelector('.film-details__comments-list');
    const commentCount = this._popupComponent
      .getElement()
      .querySelector('.film-details__comments-count');
    commentCount.innerHTML = this._comment.length;
    this._comment.forEach((comment) => {
      const itemPresenter = new CommentPresenter(
        this._containerCommentsListInPopup,
        this._handleViewAction,
      );
      itemPresenter.init(comment);
      this._collectionCommentsPresenter.set(comment.id, itemPresenter);
    });

    this._containerNewCommentInPopup = this._popupComponent
      .getElement()
      .querySelector('.film-details__comments-wrap');
    this._NewCommentPresenter = new NewCommentPresenter(
      this._containerNewCommentInPopup,
      this._handleCommentViewAction,
    );
    this._NewCommentPresenter.init();
  }

  _clearComments() {
    this._comment = this._getComments();
    this._comment.forEach((element) => {
      this._collectionCommentsPresenter.get(element.id)
        ? this._collectionCommentsPresenter.get(element.id).destroy()
        : '';
    });
    this._collectionCommentsPresenter.clear();
    this._NewCommentPresenter.destroy();
  }

  _handleEscKeydown(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      this._replacePopupToCard();
    }
  }

  _handleOpenPopupClick() {
    this._popupComponent = new MoviePopupView(this._movie, this);
    this._popupComponent.setCloseClickHandler(this._handleClosePopupClick);
    this._popupComponent.setFavoriteClickHandler(this._handleFavoriteClick);
    this._popupComponent.setWatchlistClickHandler(this._handleWatchlistClick);
    this._popupComponent.setHistoryClickHandler(this._handleHistoryClick);

    this._replaceCardToPopup();
    this._getAndRenderComments();
    this._body.classList.add('hidden-scroll');
    this._overlay.classList.add('active');
    document.addEventListener('keydown', this._handleEscKeydown);
    this._overlay.addEventListener('click', this._handleClosePopupClick);
  }

  _handleClosePopupClick() {
    this._replacePopupToCard();
  }

  _handleWatchlistClick() {
    this._movie.isWatchlist = !this._movie.isWatchlist;
    this._changeData(
      UserAction.UPDATE_MOVIE_DATA,
      UpdateType.MINOR,
      this._movie,
    );
  }

  _handleCommentViewAction(comment) {
    this._handleViewAction(
      UserAction.ADD_COMMENT,
      UpdateType.MINOR,
      {comment, movie: this._movie},
    );
  }

  _handleFavoriteClick() {
    this._changeData(
      UserAction.UPDATE_MOVIE_DATA,
      UpdateType.MINOR,
      Object.assign({}, this._movie, {
        isFavorite: !this._movie.isFavorite,
      }),
    );
  }

  _handleHistoryClick() {
    this._changeData(
      UserAction.UPDATE_MOVIE_DATA,
      UpdateType.MINOR,
      Object.assign({}, this._movie, {
        isHistory: !this._movie.isHistory,
      }),
    );
  }

  _handleViewAction(actionType, updateType, update) {
    switch (actionType) {
      case UserAction.DELETE_COMMENT:
        api
          .deleteComment(update)
          .then(() => {
            this._commentsModel.deleteComments(updateType, update);
            this._renderComments();
          })
          .then(() => {
            api
              .updateMovie(this._movie)
              .then((response) => {
                this._moviesModel.updateMovie(updateType, response);
                this._changeData(
                  UserAction.UPDATE_MOVIE_DATA,
                  UpdateType.PATCH,
                  response,
                );
              })
              .catch(() => {});
          })
          .catch(() => {});
        break;
      case UserAction.ADD_COMMENT:
        api
          .addComment(update.comment, update.movie)
          .then((res) => {
            this._commentsModel.setComments(updateType, res.comments);
            this._renderComments();
          })
          .then(() => {
            api
              .updateMovie(this._movie)
              .then((response) => {
                this._moviesModel.updateMovie(updateType, response);
                this._changeData(
                  UserAction.UPDATE_MOVIE_DATA,
                  UpdateType.PATCH,
                  response,
                );
              })
              .catch(() => {});
          })
          .catch(() => {});
        break;
    }
  }
}
