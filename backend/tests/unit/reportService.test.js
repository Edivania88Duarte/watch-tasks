jest.mock('../../src/db/pool', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const { pool } = require('../../src/db/pool');
const reportService = require('../../src/services/reportService');

describe('reportService.summary', () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  test('agrega totais a partir das consultas', async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [
          { status: 'todo', count: 2 },
          { status: 'done', count: 1 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { category_name: 'A', count: 2 },
          { category_name: '(sem categoria)', count: 1 },
        ],
      });

    const result = await reportService.summary('user-uuid');

    expect(result.total_tasks).toBe(3);
    expect(result.by_status).toHaveLength(2);
    expect(result.by_category).toHaveLength(2);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });
});
