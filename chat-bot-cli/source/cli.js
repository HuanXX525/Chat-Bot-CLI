/** Init as early as possible this file config the env */
import logger from './Tools/logconfig.js';
import {render} from 'ink';
import SearchQuery from './components/maincomponent.js';
import React from 'react';

logger.info('chat-bot-cli 启动');
render(<SearchQuery />);
