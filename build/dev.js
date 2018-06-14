const callfile = require('child_process')
const config = require('./config')
const path = require('path')
const logger = require('./logger')

const projectPath = path.join(process.cwd(), 'src')

callfile.execFile(`${config.path}/Contents/Resources/app.nw/bin/cli`, ['-o', projectPath], (err, stdout, stderr) => {

    if (err) {
        logger.error('打开失败：\n' + err)
        return
    }
    if (stderr) {
        logger.error('工具内报错\n' + stderr)
        return
    }
    logger.success('工具打开成功 \n' + stdout)

})