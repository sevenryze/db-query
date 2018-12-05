import { createConnection, getTransactionQueryRunner, prepareRepository } from "../lib";
import { PostRepository } from "./repository/post";
import { UserRepository } from "./repository/user";

async function app() {
  await createConnection({ driver: { type: "mysql" }, maxQueryExecutionTime: 5 * 1000, logOptions: ["query", "info"] });

  const userRepo = await prepareRepository(UserRepository);
  await userRepo.save({ name: "faf", age: 12 });

  const postRepo = await prepareRepository(PostRepository);
  await postRepo.save({
    authorId: "12",
    content: "sdfsdf",
    title: "sfdsf",
  });

  const transactionQueryRunner = await getTransactionQueryRunner();
  await transactionQueryRunner.startTransaction();
  const userRepoTrans = await prepareRepository(UserRepository, transactionQueryRunner);
  userRepoTrans.save({} as any);

  const postRepoTrans = await prepareRepository(PostRepository, transactionQueryRunner);
  postRepoTrans.save({} as any);
  await transactionQueryRunner.commitTransaction();
  await transactionQueryRunner.rollbackTransaction();
}

app().catch(e => console.log(e));
