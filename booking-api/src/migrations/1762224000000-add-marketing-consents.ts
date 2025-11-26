import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMarketingConsents1762224000000 implements MigrationInterface {
    name = 'AddMarketingConsents1762224000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`marketing_consents\` (\`id\` varchar(255) NOT NULL, \`email\` varchar(256) NOT NULL, \`firstName\` varchar(128) NULL, \`lastName\` varchar(128) NULL, \`phone\` varchar(32) NULL, \`consentGiven\` tinyint NOT NULL DEFAULT 1, \`consentedAt\` datetime NOT NULL, \`source\` varchar(64) NOT NULL DEFAULT 'checkout', \`orderId\` varchar(255) NULL, \`clientIp\` varchar(64) NULL, \`userAgent\` varchar(256) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_marketing_consents_email_consentedAt\` (\`email\`, \`consentedAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`marketing_consents\` ADD CONSTRAINT \`FK_marketing_consents_order\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`marketing_consents\` DROP FOREIGN KEY \`FK_marketing_consents_order\``);
        await queryRunner.query(`DROP INDEX \`IDX_marketing_consents_email_consentedAt\` ON \`marketing_consents\``);
        await queryRunner.query(`DROP TABLE \`marketing_consents\``);
    }

}

