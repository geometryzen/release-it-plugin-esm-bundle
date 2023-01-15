import assert from 'assert';
import test from 'bron';
import { factory } from 'release-it/test/util/index.js';
import VersionPlugin from './index.js';

//
// When we are testing, the package.json file will be the one for this project.
//

const namespace = 'foobar';

test('Plugin can be constructed.', async () => {
    const options = { [namespace]: {} };
    const plugin = factory(VersionPlugin, { namespace, options });
    assert.equal(typeof plugin, 'object');
    assert.equal(plugin instanceof VersionPlugin, true);
    // await assert.doesNotReject(runTasks(plugin));
});

test('Plugin is looking for the correct dependency.', async () => {
    const options = { [namespace]: {} };
    const plugin = factory(VersionPlugin, { namespace, options });
    try {
        plugin.getIncrementedVersionCI()
        assert.fail();
    }
    catch (e) {
        if (e instanceof Error) {
            assert.equal(e.message, "Missing package.json dependency 'release-it-plugin-esm-bundle'");
        }
        else {
            assert.fail();
        }
    }
});

test('Plugin returns the dependency version.', async () => {
    const options = { [namespace]: { depName: "jsxgraph" } };
    const plugin = factory(VersionPlugin, { namespace, options });
    const version = plugin.getIncrementedVersionCI()
    assert.equal(version, "1.5.0-rc2");
});
