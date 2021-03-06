const path = require('path');
const fs = require('fs');
const cmd = require('node-cmd');
const rmrf = require('rimraf');

const PATH_PACKAGES = path.join(__dirname, '../../../__packages__/');
const uniqueTextFromValidationLibrary = 'Must be invoked on a Joi instance';

describe('webpack bundling', () => {
  const workingDir = path.join(PATH_PACKAGES, 'webpack-bundle');

  beforeAll((done) => {
    rmrf(path.join(workingDir, 'dist'), (rmrfErr) => {
      if (rmrfErr) {
        done(rmrfErr);
      } else {
        done();
      }
    });
  });

  describe('for the browser', () => {
    let output;
    beforeEach((done) => {
      cmd.get(
        `(cd ${workingDir} && exec npm run build-browser)`,
        (buildErr, data) => {
          if (buildErr) {
            done({ data, buildErr });
          }
          output = fs.readFileSync(
            path.join(workingDir, 'dist', 'bundle-web.js'),
            'utf8',
          );
          done();
        },
      );
    }, 30000);

    test('should not include the joi validation library', () => {
      expect(output).not.toContain(uniqueTextFromValidationLibrary);
    });

    test('should execute with the expected output', (done) => {
      cmd.get(
        `node ${path.join(workingDir, 'dist', 'bundle-web.js')}`,
        (err, out) => {
          expect(out).toMatchSnapshot();
          done(err);
        },
      );
    });
  });

  describe('for the browser with the lite client', () => {
    let output;
    beforeEach((done) => {
      cmd.get(
        `(cd ${workingDir} && exec npm run build-browser-lite)`,
        (buildErr, data) => {
          if (buildErr) {
            done({ data, buildErr });
          }
          output = fs.readFileSync(
            path.join(workingDir, 'dist', 'bundle-web.js'),
            'utf8',
          );
          done();
        },
      );
    }, 20000);

    test('should not include the joi validation library', () => {
      expect(output).not.toContain(uniqueTextFromValidationLibrary);
    });

    test('should execute with the expected output', (done) => {
      cmd.get(
        `node ${path.join(workingDir, 'dist', 'bundle-web.js')}`,
        (err, out) => {
          expect(out).toMatchSnapshot();
          done(err);
        },
      );
    });
  });

  describe('for node', () => {
    let output;
    beforeEach((done) => {
      cmd.get(
        `(cd ${workingDir} && exec npm run build-node)`,
        (buildErr, data) => {
          if (buildErr) {
            done({ data, buildErr });
          }
          output = fs.readFileSync(
            path.join(workingDir, 'dist', 'bundle-node.js'),
            'utf8',
          );
          done();
        },
      );
    }, 20000);

    test('should include the joi validation library', () => {
      expect(output).toContain(uniqueTextFromValidationLibrary);
    });
  });
});
