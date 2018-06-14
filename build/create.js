/*
 * 生成文件夹 以及 文件
 * npm run create
 * example  /pages/aa/bb/cc/dd/文件名
 * xx.js xx.json xx.wxml xx.wxss
 */
const inquirer = require('inquirer')
const logger = require('./logger')
const path = require('path');
const fs = require('fs');
const sep = path.sep; //系统目录分隔符
const ext = ['js', 'json', 'wxml', 'wxss'];

let prompts = inquirer.prompt([{
    name: 'path',
    message: '请输入路径(pages/aa/)'
}, {
    name: 'name',
    message: '请输入文件名(aa)'
}]).then((answers) => {
    if (answers.path != '' && answers.name != '') {
        create(answers, function() {
            logger.success('success')
        })
    }
})

//创建
function create(answers, _callback) {
    var dirPath = answers.path;
    var fileName = answers.name;
    if (typeof dirPath === 'string') {
        var spath = dirPath;
        if (spath[0] === '/') {
            spath = spath.substring(1); //去除路径前面的 /
        }
        if (spath[spath.length - 1] === '/') {
            spath = spath.substring(0, spath.length - 1); //去除路径后面的 /
        }
        var dirArr = spath.split('/');
        dirArr.unshift('src'); //创建到src 目录下面
        var dir = sep + dirArr.join(sep);
        fs.exists(dir, function(exists) {
            if (!exists) {
                mkdir(0, dirArr, function() {
                    logger.success('文件夹【全部创建完成】')
                    writeFile(dirArr.join(sep), spath, fileName, _callback)
                })
            } else {
                logger.error('文件夹【已存在】')
                _callback && _callback();
            }
        })
    }
}

//创建目录
function mkdir(pos, dirArr, _callback) {
    var len = dirArr.length;
    if (pos >= len || pos > 10) {
        _callback && _callback();
        return;
    }
    var currentDir = '';
    for (var i = 0; i <= pos; i++) {
        if (i != 0) {
            currentDir += sep;
        }
        currentDir += dirArr[i];
    }
    fs.exists(currentDir, function(exists) {
        if (!exists) {
            fs.mkdir(currentDir, function(err) {
                if (err) {
                    logger.error('创建文件夹出错')
                } else {
                    logger.success(currentDir + '文件夹【创建成功】')
                    mkdir(pos + 1, dirArr, _callback)
                }
            })
        } else {
            logger.error(currentDir + '文件夹【已存在】')
            mkdir(pos + 1, dirArr, _callback)
        }
    })
}

//创建文件
function writeFile(dirPath, spath, fileName, _callback) {
    var len = ext.length;
    var fileArr = [];
    for (var i = 0; i < len; i++) {
        fileArr.push(path.join(dirPath, fileName + '.' + ext[i]));
    }
    write(0, fileArr, path.join(spath, fileName), _callback)
}

//创建文件
function write(pos, fileArr, spath, _callback) {
    var len = ext.length;
    if (pos >= len) {
        logger.success('文件【全部创建成功】')
        editAppjson(spath, _callback)
        return;
    }
    var fileNameNotes = fileArr[pos];

    switch (pos) {
        case 0:
            var fileStr = fs.readFileSync(path.join('build', 'template.js'), 'utf-8');
            fileNameNotes = '// ' + fileNameNotes + '\n' + fileStr;
            break;
        case 1:
            fileNameNotes = '{}'
            break;
        case 2:
            fileNameNotes = '<!--' + fileNameNotes + '-->\n<view>' + fileNameNotes + '</view>'
            break;
        case 3:
            fileNameNotes = '/* ' + fileNameNotes + ' */'
            break;
        default:
    }

    fs.writeFile(fileArr[pos], fileNameNotes, {
        flag: 'wx'
    }, function(err) {
        if (err) {
            logger.error(fileArr[pos] + '【已存在】')
            write(pos + 1, fileArr, spath, _callback)
            return
        }
        logger.success(fileArr[pos] + '【创建成功】')
        write(pos + 1, fileArr, spath, _callback)
    })
}

//增加app.json pages 路径配置
function editAppjson(dirPath, _callback) {
    var fileStr = path.join('src', 'app.json')
    fs.readFile(fileStr, 'utf-8', function(err, res) {
        if (err) {
            logger.error(fileStr + '【读取失败】')
        }
        var json = JSON.parse(res);
        if (json.pages.indexOf(dirPath) == -1) {
            json.pages.push(dirPath)
        }
        //然后再把数据写进去
        fs.writeFile(fileStr, JSON.stringify(json), 'utf-8', function(err) {
            if (err) {
                logger.error(fileStr + '【更新失败】')
            }
            logger.success(fileStr + '【更新成功】')
            _callback && _callback();
        })
    })
}