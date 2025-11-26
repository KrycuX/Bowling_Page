import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContactEmailTemplate1763200000000 implements MigrationInterface {
    name = 'AddContactEmailTemplate1763200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`contactFormEmailTemplate\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`contactFormEmailTemplate\``);
    }

}

