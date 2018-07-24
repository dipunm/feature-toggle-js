const path = require('path');
const fs = require('fs');
const cmd = require('node-cmd');
const rmrf = require('rimraf');

const PATH_PACKAGES = path.join(__dirname, '../../../packages/');

describe('bundling for the web with tree-shaking enabled', () => {
  let output;
  beforeEach((done) => {
    const workingDir = path.join(PATH_PACKAGES, 'webpack-bundle');
    rmrf(path.join(workingDir, 'dist'), (rmrfErr) => {
      if (rmrfErr) {
        done(rmrfErr);
      }
      cmd.get(`(cd ${workingDir} && exec npm run build)`, (buildErr, data) => {
        if (buildErr) {
          done({ data, buildErr });
        }
        output = fs.readFileSync(
          path.join(workingDir, 'dist', 'bundle.js'),
          'utf8',
        );
        done();
      });
    });
  }, 20000);

  test('should not include the validation library', () => {
    const uniqueTextFromValidationLibrary = 'Invalid reference key';
    expect(output).not.toContain(uniqueTextFromValidationLibrary);
  });
});
