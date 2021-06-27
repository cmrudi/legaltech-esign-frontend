export const AUTH_KEY = process.env.LOCAL_STORAGE_AUTH ?? "auth_dev";
export const BREAKPOINT_WIDTH = 769;
export const MODAL_ANIMATE_DURATION = 800;

export const DOC = {
  me: "me",
  all: "all",
  request: "request",
};

export const FRONTEND_URL = {
  realBase: "/",
  base: "/sign",
  login: "/login",
  sign: "/sign",
  signing: "/signing",
  me: `/${DOC.me}`,
  all: `/${DOC.all}`,
  request: `/${DOC.request}`,
  settings: "/settings",
  docs: "/docs",
  privacyPolicy: "/privacy-policy",
  sign_selected_document: "#selected-document",
  sign_add_signers: "#add-signers",
  sign_place_fields: "#place-fields",
  sign_review_send: "#review-send",
};

export const ADDSIGNER = {
  SIGN: "SIGN",
  REVIEW: "REVIEW",
};

export const publicLinks = [FRONTEND_URL.privacyPolicy];

export const highlightedNavs = [
  FRONTEND_URL.me,
  FRONTEND_URL.all,
  FRONTEND_URL.request,
];
export const PROGRESS_BAR_INTERVAL = 30;
