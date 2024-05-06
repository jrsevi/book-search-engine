const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
const cors = require('cors');

// import ApolloServer
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { typeDefs, resolvers } = require('./schemas');

// set up port and create an instance of ApolloServer
const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();

// Use cors middleware and specify the origin
app.use(cors({
  origin: ['http://localhost:3000', 'https://graphql-book-search-engine-18td.onrender.com/'], 
  credentials: true,
}));

// creating a function to start apollo server with gql schema
const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server));

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
  }

  app.use(routes);

  db.once('open', () => {
    app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
  });
}

// start the ApolloServer
startApolloServer();