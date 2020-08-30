const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const methodOverride = require("method-override");
const exphbs = require("express-handlebars");
const db = require("./db");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo")(session);
// load configs
dotenv.config({ path: "./config/config.env" });
require("./config/passport")(passport);

db();
const app = express();
const PORT = process.env.PORT || 5000;

//handlebars helper

const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require("./helpers/hbs");

// template engine - handlebars

app.engine(
  ".hbs",
  exphbs({
    helpers: { formatDate, stripTags, truncate, editIcon, select },
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// static files
app.use(express.static(path.join(__dirname, "public")));

//body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//mehtod override

app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

app.use(
  session({
    secret: "hello",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//passport
app.use(passport.initialize());
app.use(passport.session());

//set global var

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

// server listening
app.listen(PORT);
