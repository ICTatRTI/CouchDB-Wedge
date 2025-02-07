const PouchDB = require('pouchdb')
const sleep = (mseconds) => new Promise((res) => setTimeout(() => res(), mseconds))
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const log = require('tangy-log').log
const subscribeWorker = require('./subscribe-worker.js')

module.exports = async function(options = {
    url: '',
    actionPath: '',
    statePath: '',
    verbose: false,
    safeMode: true,
    batchSize: 100, 
    delayWhenNothingToProcess: 60,
    delayBetweenBatches: 0,
    exitWhenNothingToProcess: false
}) {
  await subscribeWorker.prepare(options)
  // Keep alive.
  while (true) {
    try {
      let workerState = await subscribeWorker.getWorkerState(options.statePath)
      const result = await exec(`${__dirname}/subscribe-worker-batch.js ${workerState.statePath}`)
      if (result.stdout) {
	      log.info(result.stdout)
      }
      if (result.stderr && result.stderr.indexOf('Debugger attached') === -1) {
        // Sometimes CouchDB gives up and we'll have an error. Sleep it off.
        // Ignore stderr if it's just a debugger message.
        log.error(result.stderr)
        await sleep(3*1000)
      } else {
        workerState = await subscribeWorker.getWorkerState(workerState.statePath)
        log.info(`Processed ${workerState.processed} changes.`)
        if (workerState.hasOwnProperty('processed') === false) {
          await sleep(workerState.delayWhenNothingToProcess*1000)
        } else if (workerState.processed === 0) {
          if (workerState.exitWhenNothingToProcess) {
            process.exit(0)
          } else {
            await sleep(workerState.delayWhenNothingToProcess*1000)
          }
        } else {
          await sleep(workerState.delayBetweenBatches*1000)
        }
      }
    } catch (error) {
      log.error('Processing had a critical error and may not recover.')
      console.log(error)
      await sleep(3*1000)
    }
  }
}
