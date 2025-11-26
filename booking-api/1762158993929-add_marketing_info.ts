import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMarketingInfo1762158993929 implements MigrationInterface {
    name = 'AddMarketingInfo1762158993929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`marketing_consents\` (\`id\` varchar(255) NOT NULL, \`email\` varchar(256) NOT NULL, \`firstName\` varchar(128) NULL, \`lastName\` varchar(128) NULL, \`phone\` varchar(32) NULL, \`consentGiven\` tinyint NOT NULL DEFAULT 1, \`consentedAt\` datetime NOT NULL, \`source\` varchar(64) NOT NULL DEFAULT 'checkout', \`orderId\` varchar(255) NULL, \`clientIp\` varchar(64) NULL, \`userAgent\` varchar(256) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_f5cd4ed0c3172472e2a649e600\` (\`email\`, \`consentedAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`senderEmail\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`senderName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`smtpHost\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`smtpPort\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`smtpUser\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`smtpPassword\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`app_settings\` ADD \`smtpSecure\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`marketing_consents\` ADD CONSTRAINT \`FK_d1b66a90fa53061c2a9feef15d3\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`marketing_consents\` DROP FOREIGN KEY \`FK_d1b66a90fa53061c2a9feef15d3\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`smtpSecure\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`smtpPassword\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`smtpUser\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`smtpPort\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`smtpHost\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`senderName\``);
        await queryRunner.query(`ALTER TABLE \`app_settings\` DROP COLUMN \`senderEmail\``);
        await queryRunner.query(`DROP INDEX \`IDX_f5cd4ed0c3172472e2a649e600\` ON \`marketing_consents\``);
        await queryRunner.query(`DROP TABLE \`marketing_consents\``);
    }

}
