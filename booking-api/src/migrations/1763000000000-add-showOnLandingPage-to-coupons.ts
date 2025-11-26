import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShowOnLandingPageToCoupons1763000000000 implements MigrationInterface {
    name = 'AddShowOnLandingPageToCoupons1763000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`coupons\` ADD \`showOnLandingPage\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`coupons\` DROP COLUMN \`showOnLandingPage\``);
    }

}

