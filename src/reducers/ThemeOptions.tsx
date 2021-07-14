// import sideBar6 from "../assets/utils/images/sidebar/city1.jpg";
const sideBar6 = "";
export const SET_USER_PROFILE_PICTURE =
  "THEME_OPTIONS/SET_USER_PROFILE_PICTURE";
export const SET_ENABLE_LOGIN_PAGE = "THEME_OPTIONS/SET_ENABLE_LOGIN_PAGE";

export const SET_ENABLE_BACKGROUND_IMAGE =
  "THEME_OPTIONS/SET_ENABLE_BACKGROUND_IMAGE";

export const SET_ENABLE_MOBILE_MENU = "THEME_OPTIONS/SET_ENABLE_MOBILE_MENU";
export const SET_ENABLE_MOBILE_MENU_SMALL =
  "THEME_OPTIONS/SET_ENABLE_MOBILE_MENU_SMALL";

export const SET_ENABLE_FIXED_HEADER = "THEME_OPTIONS/SET_ENABLE_FIXED_HEADER";
export const SET_ENABLE_HEADER_SHADOW =
  "THEME_OPTIONS/SET_ENABLE_HEADER_SHADOW";
export const SET_ENABLE_SIDEBAR_SHADOW =
  "THEME_OPTIONS/SET_ENABLE_SIDEBAR_SHADOW";
export const SET_ENABLE_FIXED_SIDEBAR =
  "THEME_OPTIONS/SET_ENABLE_FIXED_SIDEBAR";
export const SET_ENABLE_CLOSED_SIDEBAR =
  "THEME_OPTIONS/SET_ENABLE_CLOSED_SIDEBAR";
export const SET_ENABLE_FIXED_FOOTER = "THEME_OPTIONS/SET_ENABLE_FIXED_FOOTER";

export const SET_ENABLE_PAGETITLE_ICON =
  "THEME_OPTIONS/SET_ENABLE_PAGETITLE_ICON";
export const SET_ENABLE_PAGETITLE_SUBHEADING =
  "THEME_OPTIONS/SET_ENABLE_PAGETITLE_SUBHEADING";
export const SET_ENABLE_PAGE_TABS_ALT =
  "THEME_OPTIONS/SET_ENABLE_PAGE_TABS_ALT";

export const SET_BACKGROUND_IMAGE = "THEME_OPTIONS/SET_BACKGROUND_IMAGE";
export const SET_BACKGROUND_COLOR = "THEME_OPTIONS/SET_BACKGROUND_COLOR";
export const SET_COLOR_SCHEME = "THEME_OPTIONS/SET_COLOR_SCHEME";
export const SET_BACKGROUND_IMAGE_OPACITY =
  "THEME_OPTIONS/SET_BACKGROUND_IMAGE_OPACITY";

export const SET_HEADER_BACKGROUND_COLOR =
  "THEME_OPTIONS/SET_HEADER_BACKGROUND_COLOR";

export const setUserProfilePicture = (userProfilePicture: string) => ({
  type: SET_USER_PROFILE_PICTURE,
  userProfilePicture,
});

export const setEnableLoginPage = (enableLoginPage: boolean) => ({
  type: SET_ENABLE_LOGIN_PAGE,
  enableLoginPage,
});
export const setEnableBackgroundImage = (enableBackgroundImage: boolean) => ({
  type: SET_ENABLE_BACKGROUND_IMAGE,
  enableBackgroundImage,
});

export const setEnableFixedHeader = (enableFixedHeader: boolean) => ({
  type: SET_ENABLE_FIXED_HEADER,
  enableFixedHeader,
});

export const setEnableHeaderShadow = (enableHeaderShadow: boolean) => ({
  type: SET_ENABLE_HEADER_SHADOW,
  enableHeaderShadow,
});

export const setEnableSidebarShadow = (enableSidebarShadow: boolean) => ({
  type: SET_ENABLE_SIDEBAR_SHADOW,
  enableSidebarShadow,
});

export const setEnablePageTitleIcon = (enablePageTitleIcon: boolean) => ({
  type: SET_ENABLE_PAGETITLE_ICON,
  enablePageTitleIcon,
});

export const setEnablePageTitleSubheading = (
  enablePageTitleSubheading: boolean
) => ({
  type: SET_ENABLE_PAGETITLE_SUBHEADING,
  enablePageTitleSubheading,
});

export const setEnablePageTabsAlt = (enablePageTabsAlt: boolean) => ({
  type: SET_ENABLE_PAGE_TABS_ALT,
  enablePageTabsAlt,
});

export const setEnableFixedSidebar = (enableFixedSidebar: boolean) => ({
  type: SET_ENABLE_FIXED_SIDEBAR,
  enableFixedSidebar,
});

export const setEnableClosedSidebar = (enableClosedSidebar: boolean) => ({
  type: SET_ENABLE_CLOSED_SIDEBAR,
  enableClosedSidebar,
});

export const setEnableMobileMenu = (enableMobileMenu: boolean) => ({
  type: SET_ENABLE_MOBILE_MENU,
  enableMobileMenu,
});

export const setEnableMobileMenuSmall = (enableMobileMenuSmall: boolean) => ({
  type: SET_ENABLE_MOBILE_MENU_SMALL,
  enableMobileMenuSmall,
});

export const setEnableFixedFooter = (enableFixedFooter: boolean) => ({
  type: SET_ENABLE_FIXED_FOOTER,
  enableFixedFooter,
});

export const setBackgroundColor = (backgroundColor: string) => ({
  type: SET_BACKGROUND_COLOR,
  backgroundColor,
});

export const setHeaderBackgroundColor = (headerBackgroundColor: string) => ({
  type: SET_HEADER_BACKGROUND_COLOR,
  headerBackgroundColor,
});

export const setColorScheme = (colorScheme: string) => ({
  type: SET_COLOR_SCHEME,
  colorScheme,
});

export const setBackgroundImageOpacity = (backgroundImageOpacity: string) => ({
  type: SET_BACKGROUND_IMAGE_OPACITY,
  backgroundImageOpacity,
});

export const setBackgroundImage = (backgroundImage: string) => ({
  type: SET_BACKGROUND_IMAGE,
  backgroundImage,
});

export default function reducer(
  state: object = {
    backgroundColor: "bg-royal sidebar-text-light",
    headerBackgroundColor: "bg-strong-bliss header-text-light",
    enableMobileMenuSmall: false,
    enableLoginPage: false,
    userProfilePicture: "/assets/images/altcomp.png",
    enableMobileMenu: false,
    enableBackgroundImage: true,
    enableClosedSidebar: false,
    enableFixedHeader: true,
    enableHeaderShadow: true,
    enableSidebarShadow: true,
    enableFixedFooter: true,
    enableFixedSidebar: true,
    colorScheme: "white",
    backgroundImage: sideBar6,
    backgroundImageOpacity: "opacity-06",
    enablePageTitleIcon: true,
    enablePageTitleSubheading: true,
    enablePageTabsAlt: false,
  },
  action: any
) {
  switch (action.type) {
    case SET_USER_PROFILE_PICTURE:
      return {
        ...state,
        userProfilePicture: action.userProfilePicture,
      };
    case SET_ENABLE_LOGIN_PAGE:
      return {
        ...state,
        enableLoginPage: action.enableLoginPage,
      };
    case SET_ENABLE_BACKGROUND_IMAGE:
      return {
        ...state,
        enableBackgroundImage: action.enableBackgroundImage,
      };

    case SET_ENABLE_FIXED_HEADER:
      return {
        ...state,
        enableFixedHeader: action.enableFixedHeader,
      };

    case SET_ENABLE_HEADER_SHADOW:
      return {
        ...state,
        enableHeaderShadow: action.enableHeaderShadow,
      };

    case SET_ENABLE_SIDEBAR_SHADOW:
      return {
        ...state,
        enableSidebarShadow: action.enableSidebarShadow,
      };

    case SET_ENABLE_PAGETITLE_ICON:
      return {
        ...state,
        enablePageTitleIcon: action.enablePageTitleIcon,
      };

    case SET_ENABLE_PAGETITLE_SUBHEADING:
      return {
        ...state,
        enablePageTitleSubheading: action.enablePageTitleSubheading,
      };

    case SET_ENABLE_PAGE_TABS_ALT:
      return {
        ...state,
        enablePageTabsAlt: action.enablePageTabsAlt,
      };

    case SET_ENABLE_FIXED_SIDEBAR:
      return {
        ...state,
        enableFixedSidebar: action.enableFixedSidebar,
      };

    case SET_ENABLE_MOBILE_MENU:
      return {
        ...state,
        enableMobileMenu: action.enableMobileMenu,
      };

    case SET_ENABLE_MOBILE_MENU_SMALL:
      return {
        ...state,
        enableMobileMenuSmall: action.enableMobileMenuSmall,
      };

    case SET_ENABLE_CLOSED_SIDEBAR:
      return {
        ...state,
        enableClosedSidebar: action.enableClosedSidebar,
      };

    case SET_ENABLE_FIXED_FOOTER:
      return {
        ...state,
        enableFixedFooter: action.enableFixedFooter,
      };

    case SET_BACKGROUND_COLOR:
      return {
        ...state,
        backgroundColor: action.backgroundColor,
      };

    case SET_HEADER_BACKGROUND_COLOR:
      return {
        ...state,
        headerBackgroundColor: action.headerBackgroundColor,
      };

    case SET_COLOR_SCHEME:
      return {
        ...state,
        colorScheme: action.colorScheme,
      };

    case SET_BACKGROUND_IMAGE:
      return {
        ...state,
        backgroundImage: action.backgroundImage,
      };

    case SET_BACKGROUND_IMAGE_OPACITY:
      return {
        ...state,
        backgroundImageOpacity: action.backgroundImageOpacity,
      };
    default:
    // unknown type! based on the language,
  }
  return state;
}
