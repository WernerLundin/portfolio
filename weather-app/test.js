const array = [{ se: "ww" }, { se: "ww" }];
array.find({}, (err, element) => {
  if (!err) {
    console.log(element);
  } else {
    console.log(err);
  }
});
//
