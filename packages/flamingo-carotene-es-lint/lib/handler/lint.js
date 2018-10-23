const { spawn } = require('child_process')

/**
 * Executes the es lint
 * @param core
 */
const eslint = (core) => {
  const cliTools = core.getCliTools()
  const config = core.getConfig()

  const cmd = `yarn`
  const parameters = ['eslint', '--config', config.eslint.configFilePath, '--ignore-path', config.eslint.ignoreFilePath, '--ext', '.js', '.']

  cliTools.info('ESLint - start')

  const spawnEnv = process.env
  spawnEnv.FORCE_COLOR = true

  const childProcess = spawn(
    cmd,
    parameters,
    {
      env: spawnEnv
    }
  )

  // this is new
  const results = []
  const errors = []

  childProcess.stdout.on('data', function (data) {
    // ignore first result line... - cause its the cmd itself
    let skipLine = false

    // Don't need current cmd
    if (data.toString().trim().search('/.bin/eslint') !== -1) {
      skipLine = true
    }

    // Skip line when only console codes should be written - should come from the prettified eslint output
    if (data == '\u001B[2K' || data == '\u001B[1G') {
      skipLine = true
    }

    if (!skipLine) {
      results.push(data)
    }
  })

  childProcess.stderr.on('data', function (data) {
    errors.push(data)
  })

  childProcess.on('exit', (code) => {
    const output = ['ESLint - end'].concat(results, errors).join('\n').trim()

    if (code !== 0) {
      cliTools.warn(output)
    } else {
      cliTools.info(output)
    }

    if (config.eslint.breakOnError && errors.length > 0) {
      core.reportError(`ESLint report errors.`)
    }
  })
}

module.exports = eslint