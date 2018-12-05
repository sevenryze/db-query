import { IQueryRunner } from "../../lib";

export class PostRepository {
  public findById(id: string): Promise<object> {
    return this.queryRunner.query(``, []);
  }

  public async save(post: object) {
    this.queryRunner.query(``, []);
  }

  constructor(private queryRunner: IQueryRunner) {}
}
