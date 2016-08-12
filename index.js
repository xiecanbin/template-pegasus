var path = require('path');
var fs = require('fs');

//交互变量
exports.variables = {
  project: {
    question: '请输入模块名',
    default: '<%= DIRNAME %>'
  },
  description: {
    question: '请输入模块描述 (20字以内)'
  },
  version: {
    question: '请输入版本',
    default: '4.0.0'
  }
};

exports.commands = [
  { command: 'cnpm install'}
];
