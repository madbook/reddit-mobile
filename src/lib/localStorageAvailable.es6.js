const FEATURE_TEST_LOCAL_STORAGE = 'mobile_reddit_local_storage_feature_test';

export default function localStorageAvailable() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(FEATURE_TEST_LOCAL_STORAGE, 'yes');
      if (localStorage.getItem(FEATURE_TEST_LOCAL_STORAGE) === 'yes') {
        return true;
      }
    }
  } catch (e) {
    return false;
  }

  return false;
}
