import test from 'ava';
import {execa} from 'execa';

test('show help', async t => {
	const {stdout} = await execa('./dist/cli.js', ['--help']);
	t.true(stdout.includes('CLI Chat Bot'));
});