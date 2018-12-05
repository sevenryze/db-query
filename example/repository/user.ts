import { IQueryRunner } from "../../lib";

export class UserRepository {
  public findById(id: string): Promise<object> {
    return this.queryRunner.query(``, []);
  }

  public save(entity: object): Promise<object> {
    throw new Error("Method not implemented.");
  }

  constructor(private queryRunner: IQueryRunner) {}
}
