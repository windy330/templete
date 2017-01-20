define(function(require,module,exports){
    //base路径下的js文件都是默认的模块，可以有这种写法：var a = require('a');
    var a = require('./a');
    //用了模块别名，会到指定路径下去寻找模块
    var $ = require('jquery');
    $(document).click(function(){
        alert('1');
    });
    console.log(2322);
    console.log(a);
    console.log($);
})