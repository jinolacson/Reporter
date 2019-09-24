#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Jasmine = require('jasmine');
const glob = require('glob');
const Reporter = require('./simpleJsonJasmineReporter.js'); //Require reporter class

const argv = require('yargs').option('directories', {
  alias: 'o',
  describe: 'a newline delimited string of directories',
  demandOption: true,
  type: 'string',
}).argv;

const config = {
  dirs: argv.directories,
};


function runTests(dir) {
  const jasmine = new Jasmine();
  const reporter = new Reporter();

  jasmine.clearReporters();
  jasmine.addReporter(reporter);
  jasmine.loadConfig({
    spec_dir: path.join(dir, 'test'),
    // Had to find the absolute paths myself because jasmine couldn't seem to
    // resolve the correct paths.

    //It will read practiceSpec.js under /test/spec/ folder
    /**
     * one/test/spec/practiceSpec.js
     * two/test/spec/practiceSpec.js
     * three/test/spec/practiceSpec.js
     */
    spec_files: glob.sync(path.join(dir, 'test/spec/', '*[sS]pec.js')),
    random: false,
  });

  return new Promise((resolve, reject) => {
    jasmine.execute();
    jasmine.onComplete(status => {
      resolve(reporter.results);
    });
  });
}


/**
 * 
 * @param {*} dir = Student name and email 
 */
function parseUser(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'user.json')));
}

/**
 * 
 * @param {*} path = Read sub directories Reporter/submissions
 * 
 * I add this to read Reporter/submissions/ sub folders 
 */
function readdirAsync(path) {
  return new Promise(function (resolve, reject) {
    fs.readdir(path, function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * dirs+repoPath = Base directory+student submission folder
 */
(async function main({ dirs }) {
  const grades = {};
  students = await readdirAsync(dirs);
  for (let repoPath of students) { 
    submissionPath = dirs+repoPath;
    const user = parseUser(submissionPath);
    try {
      let results = await runTests(submissionPath);
      results.name = user.name;
      grades[user.email] = results;
    } catch (e) {
      grades[user.email] = {
        name: user.name,
        failure: e.message,
      };
    }
    console.log(JSON.stringify(grades));
  }
 
})(config);
