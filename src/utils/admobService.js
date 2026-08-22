// Google AdMob Service Utility for Pocket Budget
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, InterstitialAdPluginEvents } from '@capacitor-community/admob';

// Live Production Ad Unit IDs provided by User
export const ADMOB_IDS = {
  APP_ID: 'ca-app-pub-5003266731020231~8902794008',
  BANNER: 'ca-app-pub-5003266731020231/4963548996',
  INTERSTITIAL: 'ca-app-pub-5003266731020231/9138648050',
  REWARDED: 'ca-app-pub-5003266731020231/7429930233'
};

let isAdMobInitialized = false;
let isBannerShowing = false;
let expenseAddCount = 0;
let lastInterstitialTime = 0;

/**
 * Initialize AdMob on native Android
 */
export const initAdMob = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  if (isAdMobInitialized) return;

  try {
    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      console.log('[AdMob] ✅ Banner Ad Loaded & Displayed!');
    });

    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (err) => {
      console.warn('[AdMob] ⚠️ Banner Ad Failed To Load (AdMob unit pending propagation):', err);
    });

    AdMob.addListener(BannerAdPluginEvents.AdImpression, () => {
      console.log('[AdMob] 💰 Banner Ad Impression Recorded!');
    });

    AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
      console.log('[AdMob] ✅ Interstitial Ad Preloaded!');
    });

    AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (err) => {
      console.warn('[AdMob] ⚠️ Interstitial Failed To Load:', err);
    });

    await AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: []
    });

    isAdMobInitialized = true;
    prepareInterstitialAd().catch(() => {});
  } catch (error) {
    console.warn('[AdMob] Initialization notice:', error);
  }
};

/**
 * Display Adaptive Sticky Banner Ad at the bottom of the screen
 */
export const showStickyBanner = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    if (!isAdMobInitialized) {
      await initAdMob();
    }

    if (isBannerShowing) return;

    const options = {
      adId: ADMOB_IDS.BANNER,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: false
    };

    await AdMob.showBanner(options);
    isBannerShowing = true;
  } catch (error) {
    console.warn('[AdMob] showBanner notice:', error);
  }
};

/**
 * Hide Bottom Banner Ad
 */
export const hideStickyBanner = async () => {
  if (!Capacitor.isNativePlatform() || !isBannerShowing) return;
  try {
    await AdMob.hideBanner();
    isBannerShowing = false;
  } catch (error) {
    console.warn('[AdMob] hideBanner error:', error);
  }
};

/**
 * Resume / Show Banner if hidden
 */
export const resumeStickyBanner = async () => {
  if (!Capacitor.isNativePlatform() || isBannerShowing) return;
  try {
    await AdMob.resumeBanner();
    isBannerShowing = true;
  } catch (error) {
    showStickyBanner().catch(() => {});
  }
};

/**
 * Preload Interstitial Ad
 */
export const prepareInterstitialAd = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await AdMob.prepareInterstitial({
      adId: ADMOB_IDS.INTERSTITIAL,
      isTesting: false
    });
  } catch (err) {
    // Graceful silent ignore if already prepared
  }
};

/**
 * Trigger Smart Interstitial Ad
 * Frequency: Every 4th expense added, with a minimum 2-minute gap between popups
 */
export const showSmartInterstitial = async () => {
  if (!Capacitor.isNativePlatform()) return;

  expenseAddCount++;
  const now = Date.now();
  const timeSinceLastAd = now - lastInterstitialTime;

  // Show on every 4th transaction and at least 2 minutes apart (120,000ms)
  if (expenseAddCount % 4 === 0 && (lastInterstitialTime === 0 || timeSinceLastAd >= 120000)) {
    try {
      await AdMob.showInterstitial();
      lastInterstitialTime = Date.now();
      setTimeout(() => {
        prepareInterstitialAd().catch(() => {});
      }, 5000);
    } catch (err) {
      prepareInterstitialAd().catch(() => {});
    }
  }
};

/**
 * Trigger High-Payout Rewarded Video Ad (e.g. for Excel Export / Pro Features)
 * @param {Function} onRewardEarned - Callback when user watches the full video ad
 */
export const showRewardedVideoAd = async (onRewardEarned) => {
  if (!Capacitor.isNativePlatform()) {
    if (typeof onRewardEarned === 'function') onRewardEarned({ type: 'web_preview', amount: 1 });
    return;
  }

  try {
    await AdMob.prepareRewardVideoAd({
      adId: ADMOB_IDS.REWARDED,
      isTesting: false
    });

    const rewardItem = await AdMob.showRewardVideoAd();
    if (typeof onRewardEarned === 'function') {
      onRewardEarned(rewardItem);
    }
  } catch (err) {
    console.warn('[AdMob] showRewardVideoAd notice:', err);
    if (typeof onRewardEarned === 'function') {
      onRewardEarned({ type: 'fallback', amount: 1 });
    }
  }
};
