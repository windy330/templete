#doc for demo -如何从零开始构建一个模块化自动化的前端工程
1. yarn
> facebook研发替代npm的包下载安装工具，更高效，下过一次后的包能离线安装到项目里
> 用yarn下载包的时候会还原已下载包的，在这些第三方包上面做的更改会清除

+ 安装yarn:  `npm install -g yarn`
+ 使用: `yarn add jquery --save`
> 执行完后会生成package.json和node_modules,yarn.lock,yarn.lock使用来锁定版本防止版本改变

package | cmd 
--------|------
jQuery  | `yarn add jquery --save`  
seajs   | `yarn add seajs --save`  

2. 查看包的文档
    `npm doc seajs`
    
3. 兼容cmd，cmd（公共模块定义规范），社区定义的规范
> - 一个模块就是一个单独的文件
> - 每个模块都是一个单独的作用域
> - 预加载，懒执行


+ 引用方法
```javascript
    // 方法一,js这个文件后缀可以加也可以不加，为了简洁一般不加
    seajs.use('./js/xx.js')
    // 方法二    
    seajs.config({
            // js/main代表的是在sea.js所在的文件路径为基准去找
            // ./js/main代表的是以当前html文件去找js文件夹下的main模块
            // 将路径从以当前html文件去找改成到js文件夹中去找或相对于js文件夹下的文件去找
            base:"./js",
            // 将路径赋值给变量，代码更简洁
            alias:{
                "abc":"main.js",//没有base就找不到main模块的入口
                "juery":'jquery.js'//相对于js文件夹下的文件去找
            }
        });
    
        seajs.use('abc',function(){ // 或者写成 seajs.use("./js/main",function(){})
            console.log("sea执行了");
        })
```
+ 一般的定义方法
```javascript
    // define定义模块
    define(function(require, exports, module){
        // require加载模块
        require('./xx.js');//相对自己，相对路径
        // exports暴露模块，暴露私有的东西给外面的js文件使用 
        // 默认module.exports是一个空对象，可以挂载属性，方法，对象
    	module.exports = xxxx//要暴露出去的属性，方法，对象
    })
```
> 存在的问题，被define包裹的js文件只能通过cmd的方式调用

+ jQuery兼容
```javascript
//兼容cmd
//requir调用的时候会传define过去，证明自己是cmd模块，然后拿到暴露的对象
if (typeof define === 'function' && define.cmd) {
	define(function(require, exports, module){
		module.exports = jQuery
	})
}
```
+ zepto兼容
```javascript
//兼容cmd
if (typeof define === 'function' && define.cmd) {
	define(function(require, exports, module){
		module.exports = Zepto
	})
}
```
4. 合并压缩js
```javascript
var gulp = require('gulp');
var cmdPack = require('gulp-cmd-pack');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
 
gulp.task('cmd', function () {  
    gulp.src('./js_debug/main.js') //main文件 , //1.使用gulp-cmd-pack可以将main.js里面引用的模块与主模块合并起来
        .pipe(cmdPack({
            mainId: 'main-min', //初始化模块的id,这个id需要和主模块的名字一样，主模块才能引用其他模块
            base: './js', //base路径,main模快找require的模块的默认路径，改路径下的js文件都是默认的模块
            alias: {// 模块别名，由于main.js引用了模块别名，将模块别名注释掉，main.js就会直接去base路径里面去找jquery模块
                jquery: '../node_modules/jquery/dist/jquery.js'
            },
            ignore: ['jquery'] //这里的模块将不会打包进去                                       
        }))//2.uglify压缩js
        .pipe(uglify({ //压缩文件，这一步是可选的 
            mangle: {
                except: ['require' ,'exports' ,'module' ,'$'],//排除混淆关键字
            }
        }))
        .pipe(rename('main-min.js'))//会将1.js重命名为1.min.js
        .pipe(gulp.dest('./js'));//输出到目录 
});
```
6. 合并压缩css等自动化构建
```javascript
var gulp = require('gulp');
var cmdPack = require('gulp-cmd-pack');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');

// 合并压缩seajs
gulp.task('cmd', function () {  
    gulp.src('./js_debug/main.js') //main文件的位置
        // 1.使用gulp-cmd-pack可以将main.js里面引用的模块与主模块合并起来
        .pipe(cmdPack({
            mainId: 'main.min',//初始化模块的id,这个id需要和主模块的名字一样，压缩后的文件译者个名字为主模块的名字作为参数传入，引用其他模块
            base: './js_debug',//base路径,main模快找require的其他模块时的默认路径，该路径下的js文件都是默认的模块
            alias: {//模块别名，由于main.js引用了模块别名，将模块别名注释掉，main.js就会直接去base路径里面去找jquery模块
                jquery: 'jquery.js'
            },
            ignore: ['jquery']//这里的模块将不会打包进去
        }))//2.uglify压缩js，这一步是可选的
        .pipe(uglify({
            mangle: {
                except: ['require' ,'exports' ,'module' ,'$'],//排除混淆关键字
            }
        }))
        .pipe(rename('main.min.js'))//会将main.js重命名为main-min.js
        .pipe(gulp.dest('./js'));//输出到目录
});

// 合并压缩移动js
gulp.task('js',function(){
    gulp.src('./js_debug/jquery.js')
        // .pipe(concat('all.js'))//需要指定一个名字，作为压缩后文件的文件名
        // .pipe(gulp.dest('./js'))//合并之后放到js文件夹里面
        .pipe(uglify())
        .pipe(rename('jquery.min.js'))//会将jquery.js重命名为jquery-min.js
        .pipe(gulp.dest('./js'));
});

// 合并压缩移动css
gulp.task('css',function(){
    gulp.src('./css_debug/*.css')
        // .pipe(concat('all.css'))//合并是可选项
        .pipe(cssnano())
        // .pipe(rename('all.min.css'))//重命名是可选项
        .pipe(gulp.dest('./css'));
});
```
> 更多的自动化配置详情见gulpfile.js 文件

5. git提交
+ 
