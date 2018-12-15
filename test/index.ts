import { createConnection, getQueryRunner, getTransactionQueryRunner } from "../lib";
import { Connection } from "../lib/connection/connection";

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
    });
  });

  afterAll(async () => {
    await connection.close();
  });

  it(`Should run normal query`, async () => {
    const queryRunner = await getQueryRunner();
    const result = await queryRunner.run("SELECT 1 + 1 AS solution");

    expect(result[0].solution).toEqual(2);
  });

  it(`Should run transaction commit query`, async () => {
    const transactionQueryRunner = await getTransactionQueryRunner();
    await transactionQueryRunner.startTransaction();
    const result = await transactionQueryRunner.run(`select ? + ? AS solution`, [1, 1]);
    await transactionQueryRunner.commitTransaction();
    await transactionQueryRunner.release();

    expect(result[0].solution).toEqual(2);
  });

  it(`Should run transaction rollback query`, async () => {
    const transactionQueryRunner = await getTransactionQueryRunner();
    await transactionQueryRunner.startTransaction();
    const result = await transactionQueryRunner.run(`select ? + ? AS solution`, [1, 1]);
    await transactionQueryRunner.rollbackTransaction();
    await transactionQueryRunner.release();

    expect(result[0].solution).toEqual(2);
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
    let result = await queryRunner.run("SELECT 1 + 1 AS solution");

    expect(result[0].solution).toEqual(2);

    queryRunner = await getQueryRunner("test2");
    result = await queryRunner.run("SELECT 1 + 2 AS solution");

    expect(result[0].solution).toEqual(3);

    await tempConnection1.close();
    await tempConnection2.close();
  });
});
