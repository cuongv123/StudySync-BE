import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateQueryCacheTable1760095100000 implements MigrationInterface {
    name = 'CreateQueryCacheTable1760095100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create query_cache table for TypeORM query caching
        await queryRunner.createTable(
            new Table({
                name: "query_cache",
                columns: [
                    {
                        name: "id",
                        type: "serial",
                        isPrimary: true,
                    },
                    {
                        name: "identifier",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "time",
                        type: "bigint",
                        isNullable: false,
                    },
                    {
                        name: "duration",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "query",
                        type: "text",
                        isNullable: false,
                    },
                    {
                        name: "result",
                        type: "text",
                        isNullable: false,
                    },
                ],
                indices: [
                    {
                        name: "IDX_query_cache_identifier",
                        columnNames: ["identifier"],
                    },
                    {
                        name: "IDX_query_cache_time",
                        columnNames: ["time"],
                    },
                ],
            }),
            true
        );

        console.log('✅ Query cache table created successfully');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("query_cache");
        console.log('✅ Query cache table dropped');
    }
}
