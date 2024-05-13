import http from 'http';

import logger from 'services/logger';
import app from 'app';

const PORT = app.get('port');
const httpServer = http.createServer(app);


httpServer.listen(PORT, () => {
  logger.info('🚀 Server ready at http://localhost:5000');
});
