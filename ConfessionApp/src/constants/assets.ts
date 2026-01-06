/**
 * Asset 관리 상수
 * 
 * 프로젝트 전체에서 사용하는 이미지, 아이콘, 애니메이션 등의
 * asset을 중앙에서 관리합니다.
 */

// Lottie 애니메이션
export const ANIMATIONS = {
  diary: require('../assets/animations/diary.json'),
  emptyDocument: require('../assets/animations/empty-document.json'),
  loading: require('../assets/animations/loading.json'),
} as const;

// 배경 이미지
export const BACKGROUNDS = {
  light: require('../assets/images/backgrounds/cloud.jpg'),
  dark: require('../assets/images/backgrounds/night.jpg'),
  ocean: require('../assets/images/backgrounds/ocean.jpg'),
  sunset: require('../assets/images/backgrounds/sunset.jpg'),
  forest: require('../assets/images/backgrounds/green.jpg'),
  purple: require('../assets/images/backgrounds/purple.jpg'),
} as const;

// 아이콘
export const ICONS = {
  mood: {
    happy: require('../assets/icons/mood/smile.png'),
    sad: require('../assets/icons/mood/sad-face.png'),
    angry: require('../assets/icons/mood/angry-face.png'),
    anxious: require('../assets/icons/mood/anxious-face.png'),
    crying: require('../assets/icons/mood/crying-face.png'),
    expressionless: require('../assets/icons/mood/expressionless-face.png'),
    eyeGlasses: require('../assets/icons/mood/eye-glasses.png'),
    tearsOfJoy: require('../assets/icons/mood/face-with-tears-of-joy.png'),
    winking: require('../assets/icons/mood/winking-face-with-tongue.png'),
  },
  // TODO: action 아이콘 추가 시 주석 해제
  /*
  action: {
    write: require('../assets/icons/action/write-pen.png'),
    send: require('../assets/icons/action/send.png'),
    like: require('../assets/icons/action/like.png'),
    likeActive: require('../assets/icons/action/like-active.png'),
    dislike: require('../assets/icons/action/dislike.png'),
    dislikeActive: require('../assets/icons/action/dislike-active.png'),
    camera: require('../assets/icons/action/camera.png'),
    delete: require('../assets/icons/action/delete.png'),
    report: require('../assets/icons/action/report-flag.png'),
  },
  */
  // TODO: navigation 아이콘 추가 시 주석 해제
  /*
  navigation: {
    home: require('../assets/icons/navigation/home.png'),
    homeActive: require('../assets/icons/navigation/home-active.png'),
    reveal: require('../assets/icons/navigation/reveal.png'),
    revealActive: require('../assets/icons/navigation/reveal-active.png'),
    myDiary: require('../assets/icons/navigation/my-diary.png'),
    myDiaryActive: require('../assets/icons/navigation/my-diary-active.png'),
    profile: require('../assets/icons/navigation/profile.png'),
    profileActive: require('../assets/icons/navigation/profile-active.png'),
  },
  */
} as const;

// 로고
export const LOGO = {
  main: require('../assets/logo/logo.png'),
  // TODO: 추가 로고 버전이 필요하면 아래 주석 해제
  // icon: require('../assets/logo/logo-icon.png'),
  // white: require('../assets/logo/logo-white.png'),
} as const;

