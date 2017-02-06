import errorLogger from './errorLogger';
import xpromoEventTracker from './trackXPromoEvents';

export default [
  errorLogger(),
  xpromoEventTracker(),
];
