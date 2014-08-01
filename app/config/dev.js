module _ from 'lodash';
import { config as defaultConfig } from './config.js';

export var config = _.defaults({
}, defaultConfig);

