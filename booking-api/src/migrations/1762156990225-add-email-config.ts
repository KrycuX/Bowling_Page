import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailConfig1762156990225 implements MigrationInterface {
    name = 'AddEmailConfig1762156990225'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`senderEmail\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`senderName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`smtpHost\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`smtpPort\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`smtpUser\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`smtpPassword\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`smtpSecure\` tinyint(1) NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`smtpSecure\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`smtpPassword\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`smtpUser\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`smtpPort\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`smtpHost\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`senderName\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`senderEmail\``);
    }

}

