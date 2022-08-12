var express = require("express");
var router = express.Router();

router.use("/api", require("./api"));
let func = 
  function () {
    let foo = "text";
return foo;
};
module.exports = router;
