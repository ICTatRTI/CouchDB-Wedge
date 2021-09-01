const PouchDB = require('pouchdb')
const sleep = (mseconds) => new Promise((res) => setTimeout(() => res(), mseconds))
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const log = require('tangy-log').log
const subscribeWorker = require('./subscribe-worker.js')

module.exports = async function(options = {
    url: '',
    actionPath: '',
    postActionPath: '',
    statePath: '',
    verbose: false,
    batchSize: 100, 
    delayWhenNothingToProcess: 60*1000,
    delayBetweenBatches: 0
}) {
  await subscribeWorker.prepare(options)
  // Keep alive.
  while (true) {
    try {
      let workerState = await subscribeWorker.getWorkerState(options.statePath)
      const result = await exec(`${__dirname}/subscribe-worker-batch.js ${workerState.statePath}`)
      log.info("workerState.postActionPath: " + workerState.postActionPath)
      if (workerState.postActionPath) {
          const postAction = require(workerState.postActionPath)
          try {
              const result = await postAction(workerState)
              log.info("workerState: " + JSON.stringify(workerState))

              const finishedBatchTime = new Date().toISOString()
              // workerState['finishedBatchTime'] = finishedBatchTime
              // delete workerState['updates']
              // await subscribeWorker.setWorkerState(workerState)
              log.info("finishedBatchTime: " + finishedBatchTime)

              if (result && result.stdout) {
                  log.info(result.stdout)
              } else {
                  log.info("result: " + JSON.stringify(result))
              }
          } catch (error) {
              let errorMessage = JSON.stringify(error)
              let errorMessageText = error.message

              // Sometimes JSON.stringify wipes out the error.
              console.log("typeof error message: " + typeof error.message + " errorMessage: " + errorMessage + " errorMessageText: " + errorMessageText)
              if (typeof error.message === 'object') {
                  errorMessageText = JSON.stringify(error.message)
              }
              if (errorMessage === '{}') {
                  errorMessage = "Error : " +  " message: " + errorMessageText
              } else {
                  errorMessage = "Error : " +  " message: " + errorMessageText + " errorMessage: " + errorMessage
              }
              log.error(`Error on postAction - Error: ${errorMessage} ::::: `)
          }
      }
      if (result.stdout) {
	      log.info(result.stdout)
      }
      if (result.stderr) {
        // Sometimes CouchDB gives up and we'll have an error. Sleep it off.
        log.error(result.stderr)
        await sleep(3*1000)
      } else {
        workerState = await subscribeWorker.getWorkerState(workerState.statePath)
        if (workerState.hasOwnProperty('processed') === false || workerState.processed === 0) {
          await sleep(workerState.delayWhenNothingToProcess)
        } else {
          log.info(`Processed ${workerState.processed} changes.`)
          await sleep(workerState.delayBetweenBatches)
        }
      }
    } catch (error) {
      log.error('Processing had a critical error and may not recover.')
      console.log(error)
      await sleep(3*1000)
    }
  }
}
