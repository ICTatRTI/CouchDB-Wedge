#!/usr/bin/env node

var program = require('commander');
var subscribeAll = require('./lib/SubscribeAllDbs.js')

program
  .version('0.0.0')
  .option('-u, --url <url>', 'The Couchdb URL with credentials.', '')
  .option('-a, --actionPath <actionPath>', 'Path to an action file that contains JS for acting on each change.', process.cwd() + '/action.js')
  .option('-u, --statePath <statePath>', 'Path to a state file used for continuing an interrupted subscription.', process.cwd() + '/state.json')
  .option('-s, --batchSize <batchSize>', 'Number of changes to process in a batch.', 100)
  .option('-b, --delayBetweenBatches <delayBetweenBatches>', 'Delay between each batch (in seconds).', 0)
  .option('-n, --delayWhenNothingToProcess <delayWhenNothingToProcess>', 'Delay when there is no new changes (in seconds).', 60)
  .option('-x, --exclude <exclude>', 'A comma seperated list of databases to exclude', '')
  .option('--verbose', 'Verbose mode', false)
  .option('--safeMode', 'Safe mode', true)

program.on('--help', function(){
  process.stdout.write('  Examples:')
  process.stdout.write('')
  process.stdout.write('    $ wedge subscribe-all-dbs --url http://username:password@source-server.com:5984 --actionPath ./action.js --statePath ./state.json')
  process.stdout.write('')
  process.stdout.write('  Examples:')
  process.stdout.write('')
  process.stdout.write('To start a subscription:')
  process.stdout.write('    $ wedge subscribe-all-dbs --url http://username:password@foo.example.com/ --actionPath ./action.js --statePath ./state.json')
  process.stdout.write('')
  process.stdout.write('To restart a subscription, you just need an existing state path:')
  process.stdout.write('    $ wedge subscribe-all-dbs --url http://username:password@foo.example.com/ --statePath ./state.json')
  process.stdout.write('')
});

program.parse(process.argv);

if (program.exclude) {
  program.exclude = program.exclude.split(',')
}
else {
  program.exclude = []
}

subscribeAll(program, function(err, res) {
  if(err) {
    process.stderr.write(err)
    process.stderr.write(res)
    process.exit(1)
  }
  else {
    process.stdout.write(res)
    process.exit(0)
  }   
})

