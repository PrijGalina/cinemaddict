import {getRandomArray, getRandomElement, getRandomPositiveInteger} from './utils';
import {workingGroup, descriptionTextArray, emojiArray, arrayMovieInfo} from './data';

const getCommentDate = () => {
  const maxDayAgo = 10;
  const daysGap = getRandomPositiveInteger(maxDayAgo, 0);
  let howLongAgo = '';
  switch(daysGap) {
    case 0:
      howLongAgo = 'today';
      break;
    case 1:
      howLongAgo = 'yesterday';
      break;
    default:
      howLongAgo = `${daysGap} days ago`;
  }
  return howLongAgo;
};

const generateComment = () => {
  const emojiIndex = getRandomElement(emojiArray);
  const filmId = getRandomPositiveInteger(0, arrayMovieInfo.length);
  const comment = {
    emoji: emojiIndex,
    text: getRandomArray(descriptionTextArray, 2).join('').trim(),
    date: getCommentDate(),
    autor: getRandomElement(workingGroup),
    aboutFilm: filmId,
  };
  return comment;
};

export {generateComment};
