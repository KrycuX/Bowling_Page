import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContactSubmissions1763100000000 implements MigrationInterface {
    name = 'AddContactSubmissions1763100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`contact_submissions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(256) NOT NULL, \`email\` varchar(256) NOT NULL, \`phone\` varchar(32) NULL, \`message\` text NOT NULL, \`rodoConsent\` tinyint NOT NULL, \`marketingConsent\` tinyint NOT NULL DEFAULT 0, \`clientIp\` varchar(64) NOT NULL, \`userAgent\` varchar(512) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_contact_submissions_email_createdAt\` (\`email\`, \`createdAt\`), INDEX \`IDX_contact_submissions_createdAt\` (\`createdAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_contact_submissions_createdAt\` ON \`contact_submissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_contact_submissions_email_createdAt\` ON \`contact_submissions\``);
        await queryRunner.query(`DROP TABLE \`contact_submissions\``);
    }

}

