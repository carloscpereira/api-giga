import App from './app';

require('dotenv/config');

const port = process.env.PORT || '3333';

App.listen(port, () => console.log(`Server is running to port ${port}`));
