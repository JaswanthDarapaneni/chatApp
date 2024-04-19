const {io, app, express, cors} = require('./server.config')

const { userRoutes } = require("./routes/userRoutes");
const config = require("./env/config");
const { connectDb } = require('./dbconnect/db');
const initiateSocket = require('./socket/socket');

app.use(express.json());

// Adding cors config
app.use(cors({origin:['http://localhost:8101']}))
// connectingDatabse
connectDb();
initiateSocket(io);

// app.use('/api/auth', authRoutes )
app.use('/api/user', userRoutes);
// app.use('/api/product', productRoutes);

const PORT = process.env.PORT || 3001;

io.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


