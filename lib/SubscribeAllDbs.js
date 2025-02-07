var request = require('request')
var sys = require('sys')
var exec = require('child_process').exec;
var _ = require('underscore')

const subscribe = require('./Subscribe.js')

function puts(error, stdout, stderr) { sys.puts(stdout); sys.puts(stderr); sys.puts(error) } 

module.exports = function(program, callback) {
  request.get({uri: program.url + '/_all_dbs', json: true}, function(error, response, body) {
    if(error) return process.stderr.write(error)
    var cmd = ''
    body.forEach(function(db) {
      if (program.exclude.indexOf(db) == -1) {
        const url = `${program.url.trim()}/${db}`
        const statePath = `${program.statePath}/state-${db}.json`
        cmd = '../wedge.js subscribe --url ' + url + ' --actionPath ' + program.actionPath + ' --statePath ' + statePath + ' --batchSize ' + program.batchSize + ' --delayBetweenBatches ' + program.delayBetweenBatches + ' --delayWhenNothingToProcess ' + program.delayWhenNothingToProcess
        exec(cmd, puts)
      }
    })
  })
}
