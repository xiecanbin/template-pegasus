var path = require("path");
var pkg = require(path.join(__dirname, "./package.json"));
module.exports = {
  monitor: {      //主进程服务配置
    port: 80,     //监听80端口
    proxy_pass: [ //代理转发规则
      {
        server_name: 'localhost test.tmall.com',
        rewrite: [
          {
            rule: /^(.+)$/,
            target: 'http://127.0.0.1:3000/$1' //转发到wormhole服务所在的3000端口
          }
        ]
      },
      {
        server_name: 'g.alicdn.com',
        rewrite: [
          {
            rule: /^(.+)$/,
            target: 'http://127.0.0.1:8000/$1'
          }
        ]
      }
    ]
  },
  server: {         //server配置
    workers: [  //要启动的子进程服务
      {
        command: 'tapc monitor',
        monitor: '启动monitor成功'
      },
      {
        command: 'tapc assets -p 8000' //在8000端口启动tap assets服务
      },
      {
        command: 'tapc link -g pegasus'           //将当前目录链接到tap 本地cdn目录
      },
      {
        command: 'tapc watch'
      },
      {
        command: 'tapc preview'
      }
    ]
  }
};
