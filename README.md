# td.io

Tower Defense io game.

## Environment Setup
#### Step 1: Install Node.js
Download from Node.js website.

#### Step 2: Install Express
```
$ npm install express --save
```

#### Step 3: Install Socket.IO
```
$ npm install socket.io --save
```

#### Step 4: Install node-uuid
```
$ npm install node-uuid --save
```

#### Step 5: Install SpatialHash
```
$ npm install spatial-hash --save
```

#### Step 6: Install Browserify
```
$ npm install -g browserify
```

#### Step 7: Bundle required modules with Browserify
```
$ browserify client/index.js -o bundle.js
```

#### Step 8: Run Server
```
$ node server/Server.js
```

#### Step 7: Open in Browser
Go to localhost:4004
