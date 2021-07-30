import * as Express from 'express';
import { ObjectId } from 'mongodb';
import * as storage from './storage/MongoStorage';

const app = Express();

app.use(Express.json());
app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

const boardValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'icon', 'body'],
    properties: {
      name: {
        bsonType: 'string',
        description: 'string (required)',
      },
      icon: {
        enum: ['sushi', 'penguin', 'rocket', 'smile'],
        description: 'enum (required)',
      },
      body: {
        bsonType: 'string',
        description: 'string (required)',
      },
      pass: {
        bsonType: 'string',
        description: 'string',
      },
    },
  },
};

(async () => {
  try {
    await storage.connect();
    // await storage.createCollection('testing', 'board', boardValidator);

    const collection = await new storage.MongoStorage('testing', 'board');
    await collection.initialize();

    app.get('/board', (req, res) => {
      console.log('query=', req.query);
      const id = req.query.id;
      if (id !== undefined) {
        collection
          .find({ _id: new ObjectId(id as string) }) // TODO: ObjectId constructor may throw error
          .then((e) => {
            if (e.ok) {
              console.log(e.data);
              res.json(e.data);
            }
          })
          .catch((e) => {
            res.status(500);
            res.json(e);
          });
      } else {
        console.log('get all');
        collection
          .findAll({})
          .then((e) => {
            if (e.ok) {
              res.json(e.data);
            }
          })
          .catch((e) => {
            res.status(500);
            res.json(e);
          });
      }
    });

    app.post('/board', (req, res) => {
      const { name, time, icon, body, pass } = req.body;
      collection.insert({ name, time, icon, body, pass }).then((e) => {
        res.json(e);
      });
    });

    app.listen('4444', () => {
      console.log('listen...');
    });
  } catch (e) {
    console.error('unexpected error:', e);
  }
})();
