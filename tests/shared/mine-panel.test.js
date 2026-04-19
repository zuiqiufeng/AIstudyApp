import test from 'node:test'
import assert from 'node:assert/strict'

import { buildCheckinGrid, buildRecentCheckinCalendar } from '../../utils/mine-panel.js'

test('buildCheckinGrid maps signed and unsigned cells for the profile dashboard', () => {
	const grid = buildCheckinGrid([1, 0, 1, 0], 6)

	assert.equal(grid.length, 6)
	assert.deepEqual(grid[0], { signed: true, icon: 'check', index: 1 })
	assert.deepEqual(grid[1], { signed: false, icon: '', index: 2 })
	assert.deepEqual(grid[2], { signed: true, icon: 'check', index: 3 })
	assert.deepEqual(grid[5], { signed: false, icon: '', index: 6 })
})

test('buildRecentCheckinCalendar maps actual day keys across month boundaries', () => {
	const calendar = buildRecentCheckinCalendar(
		['2026-03-31', '2026-04-01'],
		4,
		'2026-04-02'
	)

	assert.deepEqual(calendar, [0, 1, 1, 0])
})
