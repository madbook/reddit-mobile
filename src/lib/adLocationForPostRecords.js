import { AD_LOCATION } from 'app/constants';

export default function(postRecords=[]) {
  return Math.min(AD_LOCATION, postRecords.length);
}
