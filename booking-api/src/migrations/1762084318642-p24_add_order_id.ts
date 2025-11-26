import { MigrationInterface, QueryRunner } from "typeorm";

export class P24AddOrderId1762084318642 implements MigrationInterface {
    name = 'P24AddOrderId1762084318642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`p24OrderId\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`p24OrderId\``);
    }

}
