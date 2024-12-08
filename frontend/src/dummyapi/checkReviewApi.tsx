import { ICheckReviewRow, dummyCheckReviews } from './database/dummyCheckReview';

// Mutable array to store check reviews
let checkReviews = [...dummyCheckReviews];

// Create a new check review
export const createCheckReview = (checkReview: ICheckReviewRow): ICheckReviewRow => {
  checkReviews.push(checkReview);
  return checkReview;
};

// Read all check reviews for a specific project
export const getCheckReviewsByProject = (projectId: string): ICheckReviewRow[] => {
  return checkReviews.filter(review => review.projectId === projectId);
};

// Read a specific check review
export const getCheckReview = (projectId: string, activityNo: string): ICheckReviewRow | undefined => {
  return checkReviews.find(review => review.projectId === projectId && review.activityNo === activityNo);
};

// Update a check review
export const updateCheckReview = (projectId: string, activityNo: string, updatedReview: Partial<ICheckReviewRow>): ICheckReviewRow | undefined => {
  const index = checkReviews.findIndex(review => review.projectId === projectId && review.activityNo === activityNo);
  
  if (index === -1) return undefined;
  
  checkReviews[index] = {
    ...checkReviews[index],
    ...updatedReview
  };
  
  return checkReviews[index];
};

// Delete a check review
export const deleteCheckReview = (projectId: string, activityNo: string): boolean => {
  const initialLength = checkReviews.length;
  checkReviews = checkReviews.filter(
    review => !(review.projectId === projectId && review.activityNo === activityNo)
  );
  return checkReviews.length < initialLength;
};

// Delete all check reviews for a project
export const deleteCheckReviewsByProject = (projectId: string): boolean => {
  const initialLength = checkReviews.length;
  checkReviews = checkReviews.filter(review => review.projectId !== projectId);
  return checkReviews.length < initialLength;
};
