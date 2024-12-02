import { getWBSOptions, getLevel1Options, getLevel2Options, getLevel3Options } from './database/wbsOptions';

export const WBSOptionsAPI = {
  getAllOptions: () => {
    return Promise.resolve(getWBSOptions());
  },

  getLevel1Options: () => {
    return Promise.resolve(getLevel1Options());
  },

  getLevel2Options: () => {
    return Promise.resolve(getLevel2Options());
  },

  getLevel3Options: (level2Value: string) => {
    return Promise.resolve(getLevel3Options(level2Value));
  }
};
