import loader from 'loaders';


// middleware that initialises and adds a loader for each req(uest)
export default function dataLoader(req, res, next) {
  req.loaders = loader();
  next();
}
