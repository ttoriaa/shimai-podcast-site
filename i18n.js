(function () {
  const EPISODE_TITLE_EN = {
    0: 'The Best (and Worst) Era for ADHD',
    1: 'AI Labs and Hippies | Berkeley Beyond AI',
    2: 'Behind FOMO | Does Sunk Cost Distort Decisions?',
    3: 'How Is My Worldview Running Me?',
    4: '3 A.M. Anglers in Rainy Nights | Why Sichuan-Chongqing Feels So Happy',
    5: 'My Life Dream: Farming in Hawaii',
    6: 'Hell Is Other People, Freedom Is Intimacy',
    7: 'Beyond German Driving School | Why "Being Sensible" Is My Least Favorite Compliment',
    8: 'When Consensus Collapses, Or Maybe Never Existed',
    9: 'The Prada Queen | Is Aesthetic Taste Really Downgrading?',
    10: 'Like Bali Monkeys: Try an Offline Life',
    11: 'From Auto China to Zen and the Art of Motorcycles',
    12: 'Did Avoidant Attachment Ruin Intimacy? Maybe It Is Fear of Losing Self',
    13: 'From Beijing International Film Festival to the City of Beijing',
    14: 'Is High Sensitivity a Burden or a Gift?',
    15: 'I, Permission | My Odyssey and the Odyssey of Women\'s Cinema',
    16: 'German Mood | Why Italy Is So Hard to Leave',
    18: 'What Is Flourishing | Paris Flows, Rome Pauses',
    19: 'Social Clock Jet Lag | Serbia and UTC+8 Are Only 7 Minutes Apart',
    20: 'Why Do People Feel Bored?',
    21: 'A Guide to Wasting Life | Cognitive Hygiene and White Space',
    22: 'Chinese-Style Conversations | What Are We Really Talking About?',
    23: 'Postmodern Existentialism | Social Clocks in the AI Narrative',
    24: 'As the World Sinks, We Keep Celebrating',
    25: 'Creating Order in an Entropic World | Let Everything Pass Through You',
    26: 'Under the Social Clock, It Is Okay Not to Look Decent',
    27: 'Order Talk | I Do Not Want to Be an NPC Anymore',
    28: 'Sense of Order | How We Place Ourselves in a Chaotic World',
    29: 'Collective Wedding Chronicle | A Room of Their Own',
    30: 'Restructure | Raising Yourself Again, the Siddhartha Way',
    31: 'How Are Gen Z Newcomers Doing at Work? | Chic Auntie'
  };

  function getLang() {
    const lang = new URLSearchParams(window.location.search).get('lang');
    return lang === 'en' ? 'en' : 'zh';
  }

  function withLang(url, targetLang) {
    const lang = targetLang || getLang();
    const parsed = new URL(url, window.location.origin);
    parsed.searchParams.set('lang', lang);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  }

  function localizeLinks() {
    const lang = getLang();
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';

    document.querySelectorAll('[data-i18n-href]').forEach((node) => {
      const baseHref = node.getAttribute('data-i18n-href');
      if (!baseHref) return;
      node.setAttribute('href', withLang(baseHref, lang));
    });

    document.querySelectorAll('.lang-btn').forEach((node) => {
      const targetLang = node.getAttribute('data-lang') || 'zh';
      const currentPath = `${window.location.pathname}${window.location.hash}`;
      node.setAttribute('href', withLang(currentPath, targetLang));
      node.classList.toggle('active', targetLang === lang);
      node.setAttribute('aria-pressed', String(targetLang === lang));
    });
  }

  function getBilingualEpisodeTitle(episode, lang) {
    const rawTitle = episode?.title || '';
    if (lang !== 'en') {
      return rawTitle;
    }

    const translated = EPISODE_TITLE_EN[episode?.id];
    if (!translated) {
      return rawTitle;
    }

    const match = rawTitle.match(/^(Vol\d+\.)\s*(.*)$/);
    if (!match) {
      return `${translated} / ${rawTitle}`;
    }

    const vol = match[1];
    const originalSuffix = match[2];
    return `${vol} ${translated} / ${originalSuffix}`;
  }

  window.I18N = {
    lang: getLang(),
    withLang,
    localizeLinks,
    getBilingualEpisodeTitle
  };

  document.addEventListener('DOMContentLoaded', localizeLinks);
})();