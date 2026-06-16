const ABOUT_LANG = window.I18N?.lang || 'zh';

const ABOUT_TEXT = {
  zh: {
    brand: '时髦小姨',
    navHome: '首页',
    navEpisodes: '节目',
    navAbout: '主持人',
    navContact: '联系',
    eyebrow: '主持人',
    title: '时髦小姨｜李好烦',
    desc: '在熵增世界做熵减。是初入职场的时髦小姨，也在狠狠经历奥德赛：在巴厘岛和小猴斗智斗勇、在罗马听海鸥寻找古迹与现代连接、在夏威夷种地做园艺、在加州做 homeless，在巴黎坐在波伏娃前沉思，以及各种待解锁形态。',
    featureTitle: '节目特色',
    bullet1: '女性主义｜一间属于自己的房间、波伏娃、上野千鹤子、伍尔夫...',
    bullet2: '何以丰荣｜城市切片、罗马在停留、巴黎在流动...',
    bullet3: '个人成长｜熵增世界做熵减...',
    coopTitle: '邀约与合作',
    coopDesc: '欢迎品牌邀约、听众来信或共同策划特别专辑。联系邮箱：vvickey.lee@gmail.com',
    moreInfo: '更多信息请见：',
    resumeLabel: '英文简历页面：',
    resumeLink: 'View Resume Profile (EN)',
    footer: '© 2026 时髦小姨 Podcast'
  },
  en: {
    brand: 'Chic Auntie',
    navHome: 'Home',
    navEpisodes: 'Episodes',
    navAbout: 'Host',
    navContact: 'Contact',
    eyebrow: 'Host',
    title: 'Chic Auntie | Vickie Li',
    desc: 'Vickie explores how to build personal order in a fast-moving world, sharing stories from Bali, Rome, Hawaii, California, and Paris.',
    featureTitle: 'Show Highlights',
    bullet1: 'Feminism: A Room of One\'s Own, Beauvoir, Chizuko Ueno, Woolf...',
    bullet2: 'City Narratives: Rome in stillness, Paris in motion...',
    bullet3: 'Personal Growth: reducing noise in an entropic world...',
    coopTitle: 'Partnerships & Collaborations',
    coopDesc: 'Brand collaborations, listener notes, and co-created special episodes are welcome. Contact: vvickey.lee@gmail.com',
    moreInfo: 'More information: ',
    resumeLabel: 'Resume page: ',
    resumeLink: 'View Resume Profile (EN)',
    footer: '© 2026 Chic Auntie Podcast'
  }
};

function setAboutText(id, value) {
  const node = document.querySelector(`#${id}`);
  if (node) node.textContent = value;
}

(function initAboutI18n() {
  const t = ABOUT_TEXT[ABOUT_LANG];

  setAboutText('brandText', t.brand);
  setAboutText('navHomeText', t.navHome);
  setAboutText('navEpisodesText', t.navEpisodes);
  setAboutText('navAboutText', t.navAbout);
  setAboutText('navContactText', t.navContact);
  setAboutText('aboutEyebrowText', t.eyebrow);
  setAboutText('aboutTitleText', t.title);
  setAboutText('aboutDescText', t.desc);
  setAboutText('aboutFeatureTitleText', t.featureTitle);
  setAboutText('aboutBullet1Text', t.bullet1);
  setAboutText('aboutBullet2Text', t.bullet2);
  setAboutText('aboutBullet3Text', t.bullet3);
  setAboutText('aboutCoopTitleText', t.coopTitle);
  setAboutText('aboutCoopDescText', t.coopDesc);
  setAboutText('aboutMoreInfoText', t.moreInfo);
  setAboutText('aboutResumeLabelText', t.resumeLabel);
  setAboutText('aboutResumeLinkText', t.resumeLink);
  setAboutText('footerText', t.footer);

  if (window.I18N?.localizeLinks) {
    window.I18N.localizeLinks();
  }
})();
