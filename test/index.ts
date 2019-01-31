import { Connection, ConsoleLogger, createConnection, getQueryRunner, getTransactionQueryRunner } from "../lib";

describe(`Integration test`, () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection({
      driver: {
        type: "mysql",

        database: "test",
        host: "localhost",
        password: "test",
        port: 3306,
        user: "test",
      },

      // hooks: [new ConsoleLogger()],
    });
  });

  afterAll(async () => {
    await connection.close();
  });

  it(`Should run normal query`, async () => {
    const queryRunner = await getQueryRunner();
    const { results } = await queryRunner.run("SELECT 1 + 1 AS solution");

    expect(results[0].solution).toEqual(2);
  });

  it(`Should use pooled query`, async () => {
    const queryRunner = await getQueryRunner();
    const { results } = await queryRunner.run("SELECT 1 + 1 AS solution");
    expect(results[0].solution).toEqual(2);

    const { results: results2 } = await queryRunner.run("SELECT 1 + 1 AS solution");
    expect(results2[0].solution).toEqual(2);

    const { results: results3 } = await queryRunner.run("SELECT 1 + 1 AS solution");
    expect(results3[0].solution).toEqual(2);
  });

  it(`Should run transaction commit query`, async () => {
    const transactionQueryRunner = await getTransactionQueryRunner();
    await transactionQueryRunner.startTransaction();
    const { results } = await transactionQueryRunner.run(`select ? + ? AS solution`, [1, 1]);
    await transactionQueryRunner.commitTransaction();
    await transactionQueryRunner.release();

    expect(results[0].solution).toEqual(2);
  });

  it(`Should run transaction rollback query`, async () => {
    const transactionQueryRunner = await getTransactionQueryRunner();
    await transactionQueryRunner.startTransaction();
    const { results } = await transactionQueryRunner.run(`select ? + ? AS solution`, [1, 1]);
    await transactionQueryRunner.rollbackTransaction();
    await transactionQueryRunner.release();

    expect(results[0].solution).toEqual(2);
  });

  it(`Should support multiple connections`, async () => {
    const tempConnection1 = await createConnection({
      name: "test1",

      driver: { type: "mysql", database: "test", host: "localhost", password: "test", port: 3306, user: "test" },
    });

    const tempConnection2 = await createConnection({
      name: "test2",

      driver: { type: "mysql", database: "test", host: "localhost", password: "test", port: 3306, user: "test" },
    });

    let queryRunner = await getQueryRunner("test1");
    const { results } = await queryRunner.run("SELECT 1 + 1 AS solution");

    expect(results[0].solution).toEqual(2);

    queryRunner = await getQueryRunner("test2");
    const { results: r2 } = await queryRunner.run("SELECT 1 + 2 AS solution");

    expect(r2[0].solution).toEqual(3);

    await tempConnection1.close();
    await tempConnection2.close();
  });
});
