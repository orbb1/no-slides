export type SelectorsConfigType = {
  [k: string]: {
    nextButtonSelector: string;
    imageSelector: string;
    contentSelector: string;
    mainImageSelector: string;
    blockedUrlBases?: string[];
  };
};

export const selectorsConfig: SelectorsConfigType = {
  gazetawroclawska: {
    nextButtonSelector: ".atomsGalleryButtonsNavigation__right",
    imageSelector: ".atomsGalleryImage__img",
    contentSelector: ".atomsGalleryDescription__wrapper",
    mainImageSelector: ".componentsArticleGallery__mainImgLink",
    blockedUrlBases: ["https://i.pl"],
  },
};
