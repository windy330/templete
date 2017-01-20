var gulp = require('gulp');
var cmdPack = require('gulp-cmd-pack');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var sass = require('gulp-sass');

// 移动文件夹
gulp.task('lib',function(){
    gulp.src('./lib/**/*') //将lib文件夹里面的所有内容移动位置
        .pipe(gulp.dest('./biuld/lib'));//移动到
});

//当你改动html,css,js的时候 --> 合并,压缩我们的html,js,css --> browser-sync刷新浏览器
gulp.task('biuld',function(){
    //第一步先用gulp监视index.js,如果有改动就会执行js这个任务
    gulp.watch(['./js/index.js'],['js']);

    //开启browserSyn,一旦dist里面html有改动，就会刷新浏览器
    browserSync({
        server:{
            baseDir:'./dist/'
        },
        files:['./dist/index.html']
    });
});

//合并压缩移动seajs下面的模块
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

//合并压缩移动js
gulp.task('js',function(){
    gulp.src('./js_debug/jquery.js')
        // .pipe(concat('all.js'))//需要指定一个名字，作为压缩后文件的文件名
        // .pipe(gulp.dest('./js'))//合并之后放到js文件夹里面
        .pipe(uglify())
        .pipe(rename('jquery.min.js'))//会将jquery.js重命名为jquery-min.js
        .pipe(gulp.dest('./js'));
});

//合并压缩移动css
gulp.task('css',function(){
    gulp.src('./css_debug/*.css')
        // .pipe(concat('all.css'))//合并是可选项
        .pipe(cssnano())
        // .pipe(rename('all.min.css'))//重命名是可选项
        .pipe(gulp.dest('./css'));
});

//压缩移动html，一般不压缩html
gulp.task('html',function(){
    gulp.src('./*.html')
        .pipe(htmlmin({removeComments:true,collapseWhitespace:true,collapseBooleanAttributes:true,removeEmptyAttributes:true,minifyJS:true}))
        .pipe(gulp.dest('./'));
});

//添加监视,自动化压缩
gulp.task('zip',function(){
    gulp.watch(['./js_debug/*.js','./css_debug/*.css'],['cmd','css','js']);//监听的文件，执行的任务
});

// sass文件编译
gulp.task('sass', function () {
  return gulp.src('./css_debug/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css_debug'));
});
// sass文件编译自动化
gulp.task('biultSass', ['sass'], function() {
    gulp.watch('./css_debug/*.scss', ['sass']);
})

/*执行命令
cmd1 : 自动监视，browser-sync只要全局安装一次就可以了,打开wamp,监听3000端口，
       打开360免费wifi,浏览器输入电脑ipv4地址，转到3000端口，就可以同步测试手机，测试的时候手机屏幕要设置常亮，没网也能进行测试
browser-sync start --server --files "./*.html,./css_debug/*.css,./js_debug/*.js"
cmd2 : 自动编译sass文件
gulp biultSass
cmd3 : 自动合并seajs文件，压缩js,css
gulp zip
*/